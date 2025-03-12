// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2025 NTY.studio. All Rights Reserved.

#include "DocumentationGenerator.h"
#include "CTRLDocumentableLog.h"
#include "SGraphNode.h"
#include "SGraphPanel.h"
#include "NodeFactory.h"
#include "EdGraphSchema_K2.h"
#include "Kismet2/BlueprintEditorUtils.h"
#include "Kismet2/KismetEditorUtilities.h"
#include "BlueprintNodeSpawner.h"
#include "BlueprintFunctionNodeSpawner.h"
#include "BlueprintBoundNodeSpawner.h"
#include "BlueprintComponentNodeSpawner.h"
#include "BlueprintEventNodeSpawner.h"
#include "K2Node_ComponentBoundEvent.h"
#include "K2Node_DynamicCast.h"
#include "K2Node_Message.h"
#include "XmlFile.h"
#include "Slate/WidgetRenderer.h"
#include "Engine/TextureRenderTarget2D.h"
#include "TextureResource.h"
#include "ThreadingHelpers.h"
#include "Interfaces/IPluginManager.h"
#include "Stats/StatsMisc.h"
#include "Runtime/ImageWriteQueue/Public/ImageWriteTask.h"

FDocumentationGenerator::~FDocumentationGenerator()
{
	CleanUp();
}

bool FDocumentationGenerator::GT_Init(FString const& InDocsTitle, FString const& InOutputDir, UClass* BlueprintContextClass)
{
	DummyBP = CastChecked< UBlueprint >(FKismetEditorUtilities::CreateBlueprint(
		BlueprintContextClass,
		::GetTransientPackage(),
		NAME_None,
		EBlueprintType::BPTYPE_Normal,
		UBlueprint::StaticClass(),
		UBlueprintGeneratedClass::StaticClass(),
		NAME_None
	));
	if(!DummyBP.IsValid())
	{
		return false;
	}

	Graph = FBlueprintEditorUtils::CreateNewGraph(DummyBP.Get(), TEXT("TempoGraph"), UEdGraph::StaticClass(), UEdGraphSchema_K2::StaticClass());

	DummyBP->AddToRoot();
	Graph->AddToRoot();

	GraphPanel = SNew(SGraphPanel)
		.GraphObj(Graph.Get())
		;
	// We want full detail for rendering, passing a super-high zoom value will guarantee the highest LOD.
	GraphPanel->RestoreViewSettings(FVector2D(0, 0), 10.0f);

	DocsTitle = InDocsTitle;
	
	OutputDir = InOutputDir;

	return true;
}

UK2Node* FDocumentationGenerator::GT_InitializeForSpawner(UBlueprintNodeSpawner* Spawner, UObject* SourceObject, FNodeProcessingState& OutState)
{
	if(!IsSpawnerDocumentable(Spawner, SourceObject->IsA< UBlueprint >()))
	{
		if (SourceObject->GetClass()->HasMetaData("NotDocumented"))
		{
			return nullptr;
		}
	}

	// Spawn an instance into the graph
	auto NodeInst = Spawner->Invoke(Graph.Get(), TSet<FBindingObject>(), FVector2D(0, 0));

	// Currently Blueprint nodes only
	auto K2NodeInst = Cast< UK2Node >(NodeInst);

	if(K2NodeInst == nullptr)
	{
		UE_LOG(LogCTRLDocumentable, Warning, TEXT("Failed to create node from spawner of class %s with node class %s."), *Spawner->GetClass()->GetName(), Spawner->NodeClass ? *Spawner->NodeClass->GetName() : TEXT("None"));
		return nullptr;
	}

	const auto AssociatedClass = MapToAssociatedClass(K2NodeInst, SourceObject);
	
	OutState = FNodeProcessingState();
	OutState.AssociatedClass = AssociatedClass;
	return K2NodeInst;
}

bool FDocumentationGenerator::GT_Finalize(FString OutputPath)
{
	return true;
}

/**
 * Multiply each pixel alpha by the input alpha.
 */
struct TAsyncAlphaMultiplier
{
	float AlphaMulti;
	TAsyncAlphaMultiplier(float InAlphaMulti) : AlphaMulti(InAlphaMulti) {}

	void operator()(FImagePixelData* PixelData)
	{
		check(PixelData->GetType() == EImagePixelType::Float32);

		TImagePixelData<FLinearColor>* LinearColorData = static_cast<TImagePixelData<FLinearColor>*>(PixelData);
		for (FLinearColor& Pixel : LinearColorData->Pixels)
		{
			Pixel.A = FMath::Min(1.f, Pixel.A * AlphaMulti);
		}
	}
};

void FDocumentationGenerator::CleanUp()
{
	if(GraphPanel.IsValid())
	{
		GraphPanel.Reset();
	}

	if(DummyBP.IsValid())
	{
		DummyBP->RemoveFromRoot();
		DummyBP.Reset();
	}
	if(Graph.IsValid())
	{
		Graph->RemoveFromRoot();
		Graph.Reset();
	}
}


//Create Directory, Creating Entire Structure as Necessary
//		so if JoyLevels and Folder1 do not exist in JoyLevels/Folder1/Folder2
//			they will be created so that Folder2 can be created!

//This is my solution for fact that trying to create a directory fails 
//		if its super directories do not exist


//Expects entire directory path, such as:

// C:/Folder1/Folder2/Folder3/NewFolderToMake/

//			Author: Rama
static FORCEINLINE void CreateDirectoryRecursively(FString FolderToMake)
{
	//Loop Proteciton
	const int32 MAX_LOOP_ITR = 3000; //limit of 3000 directories in the structure

	// Normalize all / and \ to TEXT("/") and remove any trailing TEXT("/") 
		//if the character before that is not a TEXT("/") or a colon
	FPaths::NormalizeDirectoryName(FolderToMake);

	//Normalize removes the last "/", but my algorithm wants it
	FolderToMake += "/";

	FString Base;
	FString Left;
	FString Remaining;

	//Split off the Root
	FolderToMake.Split(TEXT("/"), &Base, &Remaining);
	Base += "/"; //add root text to Base

	int32 LoopItr = 0;
	while (Remaining != "" && LoopItr < MAX_LOOP_ITR)
	{
		Remaining.Split(TEXT("/"), &Left, &Remaining);

		//Add to the Base
		Base += Left + FString("/"); //add left and split text to Base

		//Create Incremental Directory Structure!
		FPlatformFileManager::Get().GetPlatformFile().CreateDirectory(*Base);

		LoopItr++;
	}
}

bool FDocumentationGenerator::GenerateNodeImage(UEdGraphNode* Node, FNodeProcessingState& State)
{
	SCOPE_SECONDS_COUNTER(GenerateNodeImageTime);

	const FVector2D DrawSize(1024.0f, 1024.0f);

	bool bSuccess = false;

	AdjustNodeForSnapshot(Node);

	FString NodeName = GetNodeDocId(Node);

	FIntRect Rect;
	
	TUniquePtr<TImagePixelData<FLinearColor>> PixelData;

	bSuccess = CTRLDocumentable::RunOnGameThreadRetVal([this, Node, DrawSize, &Rect, &PixelData]
	{
		auto NodeWidget = FNodeFactory::CreateNodeWidget(Node);
		NodeWidget->SetOwner(GraphPanel.ToSharedRef());

		const bool bUseGammaCorrection = true;
		FWidgetRenderer Renderer(bUseGammaCorrection);
		Renderer.SetIsPrepassNeeded(true);
		auto RenderTarget = Renderer.DrawWidget(NodeWidget.ToSharedRef(), DrawSize);
		
		const FVector2D DesiredDouble = NodeWidget->GetDesiredSize();
		const FIntPoint DesiredInt(DesiredDouble.X, DesiredDouble.Y);

		auto Desired = NodeWidget->GetDesiredSize();
	
		FTextureRenderTargetResource* RTResource = RenderTarget->GameThread_GetRenderTargetResource();
		Rect = FIntRect(0, 0, DesiredInt.X, DesiredInt.Y);
		//Rect = FIntRect(0, 0, (int32)Desired.X, (int32)Desired.Y);
		FReadSurfaceDataFlags ReadPixelFlags(RCM_UNorm);
		ReadPixelFlags.SetLinearToGamma(false); // @TODO: is this gamma correction, or something else?

		PixelData = MakeUnique<TImagePixelData<FLinearColor>>(DesiredInt);
		PixelData->Pixels.SetNumUninitialized(DesiredInt.X * DesiredInt.Y);
		
		TArray<FColor> Pixels;

		if (RTResource->ReadLinearColorPixelsPtr(PixelData->Pixels.GetData(), ReadPixelFlags, Rect) == false)
		{
			UE_LOG(LogCTRLDocumentable, Warning, TEXT("Failed to read pixels for node image."));
			return false;
		}

		return true;
	});

	if(!bSuccess)
	{
		return false;
	}

	const FString ClassNamePath = State.AssociatedClass->GetName() + "/";

	const FString ImageBasePath = FPaths::Combine(IPluginManager::Get().FindPlugin("CTRLDocumentable")->GetBaseDir() + "/web/public/") / TEXT("img/") / ClassNamePath;

	
	if (!FPaths::DirectoryExists(ImageBasePath))
	{
		CreateDirectoryRecursively(ImageBasePath);
	}
	State.RelImageBasePath = "../img/" + ClassNamePath;
	
	FString ImgFilename = FString::Printf(TEXT("nd_img_%s.png"), *NodeName);
	ImgFilename = FPaths::MakeValidFileName(ImgFilename, '_');
	FString ScreenshotSaveName = ImageBasePath / ImgFilename;
	TUniquePtr<FImageWriteTask> ImageTask = MakeUnique<FImageWriteTask>();
	ImageTask->PixelData = MoveTemp(PixelData);
	ImageTask->Filename = ScreenshotSaveName;
	ImageTask->Format = EImageFormat::PNG;
	ImageTask->CompressionQuality = (int32)EImageCompressionQuality::Default;
	ImageTask->bOverwriteFile = true;
	//ImageTask->PixelPreProcessors.Add(TAsyncAlphaWrite<FLinearColor>(255));
	ImageTask->PixelPreProcessors.Add(TAsyncAlphaMultiplier(2.f));
	if(ImageTask->RunTask())
	{
		// Success!
		bSuccess = true;
		State.ImageFilename = ImgFilename;
	}
	else
	{
		UE_LOG(LogCTRLDocumentable, Warning, TEXT("Failed to save screenshot image for node: %s"), *NodeName);
	}

	return bSuccess;
}

inline FString WrapAsCDATA(FString const& InString)
{
	return TEXT("<![CDATA[") + InString + TEXT("]]>");
}

inline FXmlNode* AppendChild(FXmlNode* Parent, FString const& Name)
{
	Parent->AppendChildNode(Name, FString());
	return Parent->GetChildrenNodes().Last();
}

inline FXmlNode* AppendChildRaw(FXmlNode* Parent, FString const& Name, FString const& TextContent)
{
	Parent->AppendChildNode(Name, TextContent);
	return Parent->GetChildrenNodes().Last();
}

inline FXmlNode* AppendChildCDATA(FXmlNode* Parent, FString const& Name, FString const& TextContent)
{
	Parent->AppendChildNode(Name, WrapAsCDATA(TextContent));
	return Parent->GetChildrenNodes().Last();
}

// For K2 pins only!
bool ExtractPinInformation(UEdGraphPin* Pin, FString& OutName, FString& OutType, FString& OutDescription)
{
	FString Tooltip;
	Pin->GetOwningNode()->GetPinHoverText(*Pin, Tooltip);
	if(!Tooltip.IsEmpty())
	{
		// @NOTE: This is based on the formatting in UEdGraphSchema_K2::ConstructBasicPinTooltip.
		// If that is changed, this will fail!
		
		auto TooltipPtr = *Tooltip;

		// Parse name line
		FParse::Line(&TooltipPtr, OutName);
		// Parse type line
		FParse::Line(&TooltipPtr, OutType);

		// Currently there is an empty line here, but FParse::Line seems to gobble up empty lines as part of the previous call.
		// Anyway, attempting here to deal with this generically in case that weird behaviour changes.
		while(*TooltipPtr == TEXT('\n'))
		{
			FString Buf;
			FParse::Line(&TooltipPtr, Buf);
		}

		// What remains is the description
		OutDescription = TooltipPtr;
	}

	// @NOTE: Currently overwriting the name and type as suspect this is more robust to future engine changes.

	OutName = Pin->GetDisplayName().ToString();
	if(OutName.IsEmpty() && Pin->PinType.PinCategory == UEdGraphSchema_K2::PC_Exec)
	{
		OutName = Pin->Direction == EEdGraphPinDirection::EGPD_Input ? TEXT("In") : TEXT("Out");
	}

	OutType = UEdGraphSchema_K2::TypeToText(Pin->PinType).ToString();

	return true;
}


FString FDocumentationGenerator::GetFunctionFlags(UFunction* InFunction)
{
	FString Result = "";
	if (InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Public))
	{
		Result += "Public";
	}
	else if (InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Private))
	{
		Result += "Private";
	}
	else if (InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Protected))
	{
		Result += "Protected";
	}
	if (!InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Final))
	{
		Result += " | Virtual";
	}
	if (InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Static))
	{
		Result += " | Static";
	}
	if (InFunction->HasAnyFunctionFlags(EFunctionFlags::FUNC_Const))
	{
		Result += " | Const";
	}
	return Result;
}



inline bool ShouldDocumentPin(UEdGraphPin* Pin)
{
	return !Pin->bHidden;
}

bool FDocumentationGenerator::GenerateNodeDocs(UK2Node* Node, FNodeProcessingState& State, FJsonObject& ObjectMeta)
{
	SCOPE_SECONDS_COUNTER(GenerateNodeDocsTime);
	FJsonObject* NodeInfo = new FJsonObject;
	NodeInfo->SetStringField("docsName", DocsTitle);
	const FString FriendlyClasId = GetClassDocId(State.AssociatedClass);
	NodeInfo->SetStringField("classId", FriendlyClasId);
	FString FriendlyClasName = FBlueprintEditorUtils::GetFriendlyClassDisplayName(State.AssociatedClass).ToString();
	NodeInfo->SetStringField("className", FriendlyClasName);
	FString NodeShortTitle = Node->GetNodeTitle(ENodeTitleType::ListView).ToString();
	NodeInfo->SetStringField("shortTitle", NodeShortTitle.TrimEnd());
	FString NodeFullTitle = Node->GetNodeTitle(ENodeTitleType::FullTitle).ToString();
	auto TargetIdx = NodeFullTitle.Find(TEXT("Target is "), ESearchCase::CaseSensitive);
	if(TargetIdx != INDEX_NONE)
	{
		NodeFullTitle = NodeFullTitle.Left(TargetIdx).TrimEnd();
	}
	NodeInfo->SetStringField("fullTitle",NodeFullTitle);
	FString NodeDesc = Node->GetTooltipText().ToString();
	TargetIdx = NodeDesc.Find(TEXT("Target is "), ESearchCase::CaseSensitive);
	if(TargetIdx != INDEX_NONE)
	{
		NodeDesc = NodeDesc.Left(TargetIdx).TrimEnd();
	}
	NodeInfo->SetStringField("description", NodeDesc);
	NodeInfo->SetStringField("imgPath", State.RelImageBasePath / State.ImageFilename);
	NodeInfo->SetStringField("description", Node->GetMenuCategory().ToString());
	TArray<TSharedPtr<FJsonValue>> Jinputs;
	TArray<TSharedPtr<FJsonValue>> Joutputs;
	for(auto Pin : Node->Pins)
	{
		if(Pin->Direction == EEdGraphPinDirection::EGPD_Input)
		{
			if(ShouldDocumentPin(Pin))
			{
				FJsonObject *JInput = new FJsonObject;
				FString PinName, PinType, PinDesc;
				ExtractPinInformation(Pin, PinName, PinType, PinDesc);
				JInput->SetStringField("name", PinName);
				JInput->SetStringField("type", PinType);
				JInput->SetStringField("description", PinDesc.Len() > 0  ? PinDesc : "$no_comments");
				Jinputs.Add(MakeShared<FJsonValueObject>(MakeShared<FJsonObject>(*JInput)));
			}
		}
	}

	for(auto Pin : Node->Pins)
	{
		if(Pin->Direction == EEdGraphPinDirection::EGPD_Output)
		{
			if(ShouldDocumentPin(Pin))
			{
				FString PinName, PinType, PinDesc;
				ExtractPinInformation(Pin, PinName, PinType, PinDesc);
				FJsonObject *JOutput = new FJsonObject;
				JOutput->SetStringField("name", PinName);
				JOutput->SetStringField("type", PinType);
				JOutput->SetStringField("description", PinDesc.Len() > 0  ? PinDesc : "$no_comments");
				Joutputs.Add(MakeShared<FJsonValueObject>(MakeShared<FJsonObject>(*JOutput)));
			}
		}
	}
	NodeInfo->SetArrayField("inputs", Jinputs);
	NodeInfo->SetArrayField("outputs", Joutputs);
	ObjectMeta = *NodeInfo;
	
	return true;
}


FString FDocumentationGenerator::ExtractFunctionDescription(const FString& FunctionTooltip)
{
	FString Result = "";
	FString CurrentStr;

	auto TooltipPtr = *FunctionTooltip;

	while (FParse::Line(&TooltipPtr, CurrentStr, true))
	{
		if (!CurrentStr.IsEmpty())
		{
			TArray<FString> Out;
			CurrentStr = CurrentStr.TrimStartAndEnd();
			CurrentStr.ParseIntoArray(Out, TEXT(" "), true);
    		if (Out.Num() > 1 && (Out[0].Equals("@param", ESearchCase::IgnoreCase) || Out[0].Equals("@return", ESearchCase::IgnoreCase)))
			{
				break;
			}
			Result += JoinArrayOfStrings(Out);
		}

	}
	if (Result.EndsWith("\n"))
	{
		Result.RemoveAt(Result.Len() - 1, 1);
		Result = Result.TrimStartAndEnd();
	}
	return Result;
}

FString FDocumentationGenerator::ExtractFunctionParamDescription(const FString& FunctionTooltip, const FString& ParamName, const FString& DefaultTooltip, bool ExtractReturnInfo)
{
	FString Result;
	FString CurrentStr;
	bool    Found = false;

	auto TooltipPtr = *FunctionTooltip;

	while (FParse::Line(&TooltipPtr, CurrentStr, true))
	{
		if (!CurrentStr.IsEmpty())
		{
			TArray<FString> Out;
			CurrentStr = CurrentStr.TrimStartAndEnd();
			CurrentStr.ParseIntoArray(Out, TEXT(" "), true);
			if (!Found)
			{
				if (Out.Num() > 1 && ((Out[0].Equals("@param", ESearchCase::IgnoreCase) && Out[1].Equals(ParamName, ESearchCase::IgnoreCase))))
				{
					Found = true;
					Result += JoinArrayOfStrings(Out, 2);
				}
				else if (Out.Num() > 0 && (ExtractReturnInfo && Out[0].Equals("@return", ESearchCase::IgnoreCase)))
				{
					Found = true;
					Result += JoinArrayOfStrings(Out, 1);
				}
			}
			else
			{
				if (Out.Num() > 1 && (Out[0].Equals("@param", ESearchCase::IgnoreCase) || Out[0].Equals("@return", ESearchCase::IgnoreCase)))
				{
					break;
				}
				Result += JoinArrayOfStrings(Out);
			}
		}

	}
	
	if (!Found)
	{
		return DefaultTooltip;
	}

	if (Result.EndsWith("\n"))
	{
		Result.RemoveAt(Result.Len() - 1, 1);
		Result = Result.TrimStartAndEnd();
	}

	return Result;
}

FString FDocumentationGenerator::JoinArrayOfStrings(const TArray<FString>& Array, int Start, bool AddLineEndings)
{
	FString ResultString = "";

	if (!(Array.Num() > Start))
	{
		return FString();
	}

	for (int i = Start; i < Array.Num(); i++)
	{
		ResultString += Array[i] + " ";
	}

	if (AddLineEndings)
	{
		ResultString += "\n";
	}

	return ResultString;

}


void FDocumentationGenerator::AdjustNodeForSnapshot(UEdGraphNode* Node)
{
	// Hide default value box containing 'self' for Target pin
	if(auto K2_Schema = Cast< UEdGraphSchema_K2 >(Node->GetSchema()))
	{
		if(auto TargetPin = Node->FindPin(K2_Schema->PN_Self))
		{
			TargetPin->bDefaultValueIsIgnored = true;
		}
	}
}

FString FDocumentationGenerator::GetClassDocId(UClass* Class)
{
	FString DocId = Class ? Class->GetPrefixCPP() + Class->GetName() : "";
	if (DocId.Contains("ASKEL_"))
	{
		DocId = DocId.Replace(TEXT("ASKEL_"), TEXT(""));
		DocId = DocId.Replace(TEXT("_C"), TEXT(""));
	}

	if (DocId.Contains("USKEL_"))
	{
		DocId = DocId.Replace(TEXT("USKEL_"), TEXT(""));
		DocId = DocId.Replace(TEXT("_C"), TEXT(""));
	}

	return DocId;
}

FString FDocumentationGenerator::GetNodeDocId(UEdGraphNode* Node)
{
	// @TODO: Not sure this is right thing to use
	return Node->GetDocumentationExcerptName();
}


#include "BlueprintVariableNodeSpawner.h"
#include "BlueprintDelegateNodeSpawner.h"
#include "K2Node_CallFunction.h"
#include "K2Node_DynamicCast.h"

/*
This takes a graph node object and attempts to map it to the class which the node conceptually belong to.
If there is no special mapping for the node, the function determines the class from the source object.
*/
UClass* FDocumentationGenerator::MapToAssociatedClass(UK2Node* NodeInst, UObject* Source)
{
	// For nodes derived from UK2Node_CallFunction, associate with the class owning the called function.
	if(auto FuncNode = Cast< UK2Node_CallFunction >(NodeInst))
	{
		auto Func = FuncNode->GetTargetFunction();
		if(Func)
		{
			return Func->GetOwnerClass();
		}
	}

	// Default fallback
	if(auto SourceClass = Cast< UClass >(Source))
	{
		return SourceClass;
	}
	else if(auto SourceBP = Cast< UBlueprint >(Source))
	{
		return SourceBP->GeneratedClass;
	}
	else
	{
		return nullptr;
	}
}

bool FDocumentationGenerator::IsSpawnerDocumentable(UBlueprintNodeSpawner* Spawner, bool bIsBlueprint)
{
	// Spawners of or deriving from the following classes will be excluded
	static const TSubclassOf< UBlueprintNodeSpawner > ExcludedSpawnerClasses[] = {
		UBlueprintVariableNodeSpawner::StaticClass(),
		UBlueprintDelegateNodeSpawner::StaticClass(),
		UBlueprintBoundNodeSpawner::StaticClass(),
		UBlueprintComponentNodeSpawner::StaticClass(),
		
	};

	// Spawners of or deriving from the following classes will be excluded in a blueprint context
	static const TSubclassOf< UBlueprintNodeSpawner > BlueprintOnlyExcludedSpawnerClasses[] = {
		UBlueprintEventNodeSpawner::StaticClass(),
	};

	// Spawners for nodes of these types (or their subclasses) will be excluded
	static const TSubclassOf< UK2Node > ExcludedNodeClasses[] = {
		UK2Node_DynamicCast::StaticClass(),
		UK2Node_Message::StaticClass(),
		UK2Node_ComponentBoundEvent::StaticClass(),
	};

	// Function spawners for functions with any of the following metadata tags will also be excluded
	static const FName ExcludedFunctionMeta[] = {
		TEXT("BlueprintAutocast")
	};

	static const uint32 PermittedAccessSpecifiers = (FUNC_Public | FUNC_Protected);


	for(auto ExclSpawnerClass : ExcludedSpawnerClasses)
	{
		if(Spawner->IsA(ExclSpawnerClass))
		{
			return false;
		}
	}

	if(bIsBlueprint)
	{
		for(auto ExclSpawnerClass : BlueprintOnlyExcludedSpawnerClasses)
		{
			if(Spawner->IsA(ExclSpawnerClass))
			{
				return false;
			}
		}
	}

	for(auto ExclNodeClass : ExcludedNodeClasses)
	{
		if(Spawner->NodeClass->IsChildOf(ExclNodeClass))
		{
			return false;
		}
	}

	if(auto FuncSpawner = Cast< UBlueprintFunctionNodeSpawner >(Spawner))
	{
		auto Func = FuncSpawner->GetFunction();

		// @NOTE: We exclude based on access level, but only if this is not a spawner for a blueprint event
		// (custom events do not have any access specifiers)
		if((Func->FunctionFlags & FUNC_BlueprintEvent) == 0 && (Func->FunctionFlags & PermittedAccessSpecifiers) == 0)
		{
			return false;
		}

		for(auto const& Meta : ExcludedFunctionMeta)
		{
			if(Func->HasMetaData(Meta))
			{
				return false;
			}
		}
	}

	return true;
}


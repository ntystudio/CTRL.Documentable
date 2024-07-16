// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#include "TaskProcessor.h"
#include "CTRLDocumentableLog.h"
#include "DocumentationGenerator.h"
#include "BlueprintActionDatabase.h"
#include "BlueprintNodeSpawner.h"
#include "K2Node.h"
#include "Async/TaskGraphInterfaces.h"
#include "Enumeration/ISourceObjectEnumerator.h"
#include "Enumeration/NativeModuleEnumerator.h"
#include "Enumeration/ContentPathEnumerator.h"
#include "Enumeration/CompositeEnumerator.h"
#include "Widgets/Notifications/SNotificationList.h"
#include "Framework/Notifications/NotificationManager.h"
#include "ThreadingHelpers.h"
#include "CTRLDocumentable.h"
#include "Interfaces/IPluginManager.h"
#include "HAL/FileManager.h"
#include "HAL/PlatformProcess.h"
#include "Kismet2/KismetEditorUtilities.h"


#define LOCTEXT_NAMESPACE "CTRLDocumentable"

TArray<TSharedPtr<FJsonValue>> FTaskProcessor::Classes;


FTaskProcessor::FTaskProcessor()
{
	bRunning = false;
	bTerminationRequest = false;
}

void FTaskProcessor::QueueTask(FGenerationSettings const& Settings)
{
	TSharedPtr< FGenTask > NewTask = MakeShareable(new FGenTask());
	NewTask->Settings = Settings;

	FNotificationInfo Info(LOCTEXT("DocGenWaiting", "Documentation generation waiting"));
	Info.Image = nullptr;
	Info.FadeInDuration = 0.2f;
	Info.ExpireDuration = 5.0f;
	Info.FadeOutDuration = 1.0f;
	Info.bUseThrobber = true;
	Info.bUseSuccessFailIcons = true;
	Info.bUseLargeFont = true;
	Info.bFireAndForget = false;
	FSimpleDelegate CancelDelegate;
	CancelDelegate.BindRaw(this, &FTaskProcessor::Stop);
	const FNotificationButtonInfo CancelBtn(FText::FromString("Cancel"), FText::FromString("Cancel"), CancelDelegate, SNotificationItem::CS_Pending);
	Info.ButtonDetails.Add(CancelBtn);
	NewTask->Notification = FSlateNotificationManager::Get().AddNotification(Info);
	NewTask->Notification->SetCompletionState(SNotificationItem::CS_Pending);

	Waiting.Enqueue(NewTask);
}

bool FTaskProcessor::IsRunning() const
{
	return bRunning;
}

bool FTaskProcessor::Init()
{
	bRunning = true;
	return true;
}

uint32 FTaskProcessor::Run()
{
	TSharedPtr< FGenTask > Next;

	TArray<UPackage*> NativePackages;
	
	for(auto& Module : UGenerationSettingsObject::Get()->Settings.NativeModules)
	{
		FString PackagePath = FString::Printf(TEXT("/Script/%s"), *Module.ToString());
		if (UPackage* Package = FindPackage(nullptr, *PackagePath))
		{
			NativePackages.AddUnique(Package);
		}
	}
	
	
	//Classes.Empty();
	
	for(TObjectIterator< UClass > ClassIt; ClassIt; ++ClassIt)
	{
		UClass* Class = *ClassIt;

		// Only interested in native C++ classes
		if(!Class->IsNative())
		{
			continue;
		}

		if (!NativePackages.Contains(Class->GetOutermost()))
		{
			continue;
		}

		// Ignore deprecated
		if(Class->HasAnyClassFlags(CLASS_Deprecated | CLASS_NewerVersionExists))
		{
			continue;
		}

#if WITH_EDITOR
		// Ignore skeleton classes (semi-compiled versions that only exist in-editor)
		if(FKismetEditorUtilities::IsClassABlueprintSkeleton(Class))
		{
			continue;
		}
#endif
		FString ClassName = Class->GetPrefixCPP() + Class->GetName();
		UE_LOG(LogTemp, Warning, TEXT("Found class: %s"), *ClassName);
	
		if (ProcessClass(Class))
		{
			Classes.Add(MakeShared<FJsonValueObject>(FJsonValueObject(SerializeClassInfo(Class))));
		}
	}
	
	FJsonObject* ObjectMeta = new FJsonObject;
	ObjectMeta->SetArrayField("Classes", Classes);
	FString JsonString;
	FJsonSerializer::Serialize(Classes, TJsonWriterFactory<>::Create(&JsonString, 0));
	FFileHelper::SaveStringToFile(JsonString, *(FPaths::ProjectSavedDir() + "/dump.json"));
	// Create a read and write pipe for the child process
	void* PipeRead = nullptr;
	void* PipeWrite = nullptr;
	verify(FPlatformProcess::CreatePipe(PipeRead, PipeWrite));
	
	while(!bTerminationRequest && Waiting.Dequeue(Next))
	{
		ProcessTask(Next);
	}

	return 0;
}

void FTaskProcessor::Exit()
{
	bRunning = false;
}

void FTaskProcessor::Stop()
{
	Current->Task->Notification->SetText(LOCTEXT("DocGenerationCancelled", "Generation cancelled!"));
	Current->Task->Notification->SetCompletionState(SNotificationItem::CS_Fail);
	Current->Task->Notification->SetExpireDuration(2.0f);

	Current->Task->Notification->ExpireAndFadeout();
	bTerminationRequest = true;
}

TArray<TSharedPtr<FJsonValue>> GetClassHierarchy(UClass* Class)
{
	TArray<TSharedPtr<FJsonValue>> Output;
	if (Class)
	{
		// Traverse the parent classes
		const UClass* ParentClass = Class->GetSuperClass();
		while (ParentClass)
		{
			TArray<TSharedPtr<FJsonValue>> Temp;
			Temp.Add(MakeShared<FJsonValueString>(FJsonValueString(ParentClass->GetPrefixCPP() + ParentClass->GetName())));
			Temp.Append(Output);
			Output = Temp;
			ParentClass = ParentClass->GetSuperClass();
		}

		return Output;
	}
	return TArray<TSharedPtr<FJsonValue>>();
}

bool FTaskProcessor::ProcessClass(UClass* Class)
{
	
	if (ProcessedClasses.Contains(Class))
	{
		return false;
	}

	ProcessedClasses.Add(Class);
	
	return true;
}

TSharedRef<FJsonObject> FTaskProcessor::SerializeClassInfo(UClass* Class)
{
	const FString ClassName = Class->GetPrefixCPP() + Class->GetName();

	FJsonObject* ClassInfo = new FJsonObject;
	TArray<TSharedPtr<FJsonValue>> Functions;
	TArray<TSharedPtr<FJsonValue>> Props;
	
	ClassInfo->SetStringField("className", ClassName);
	ClassInfo->SetArrayField("classHierarchy", GetClassHierarchy(Class));
	ClassInfo->SetStringField("path", "Classes/Default/" + ClassName);
	if (Class->HasMetaData("ClassFilter"))
	{
		ClassInfo->SetStringField("path", FString::Printf(TEXT("Classes/%s/%s"), *Class->GetMetaData("ClassFilter"), *ClassName));
	}
	TArray<FName> FunctionList;
	Class->GenerateFunctionList(FunctionList);
	for (TFieldIterator<FProperty> It(Class); It; ++It)
	{
		const FProperty* ClassProperty = *It;
		if (ClassProperty->GetOwnerClass() != Class)
		{
			continue;
		}
		FString Type = ClassProperty->GetCPPType();
		FString Name = ClassProperty->GetName();
		TSharedPtr<FJsonObject> JClassProp = MakeShared<FJsonObject>();
		JClassProp->SetStringField("name", Name);
		JClassProp->SetStringField("type", Type);
		JClassProp->SetArrayField("flags", GetPropertyFlags(ClassProperty));
		JClassProp->SetStringField("description", ClassProperty->GetToolTipText().ToString());
		Props.Add(MakeShared<FJsonValueObject>(FJsonValueObject(JClassProp)));
	}
	for (auto& Func : FunctionList)
	{
		if (const auto Function = Class->FindFunctionByName(Func))
		{
			const TSharedPtr<FJsonObject> JFunc = MakeShared<FJsonObject>();
			TArray<TSharedPtr<FJsonValue>> Params;
			JFunc->SetStringField("name", Function->GetName());
			JFunc->SetStringField("description", Function->GetToolTipText().ToString());
			JFunc->SetArrayField("flags", GetFunctionFlags(Function));
			JFunc->SetStringField("returnType", "void");
			for (TFieldIterator<FProperty> It(Function); It && It->HasAnyPropertyFlags(CPF_Parm); ++It)
			{
				const FProperty* FunctionProperty = *It;
				FString Type = FunctionProperty->GetCPPType();
				FString Name = FunctionProperty->GetName();
				TSharedPtr<FJsonObject> JFuncParam = MakeShared<FJsonObject>();
				if (FunctionProperty->HasAnyPropertyFlags(CPF_ConstParm))
				{
					if (FunctionProperty->HasAnyPropertyFlags(CPF_ReferenceParm | CPF_OutParm))
					{
						Type = Type + "&";
					}
					Type = "const " + Type;
				}
				if (FunctionProperty->HasAnyPropertyFlags(CPF_ReturnParm) || Name == "ReturnValue")
				{
					JFunc->SetStringField("returnType", Type);
					continue;
				}
				JFuncParam->SetStringField("name", Name);
				JFuncParam->SetStringField("type", Type);
				JFuncParam->SetStringField("description", FunctionProperty->GetToolTipText().ToString());
				JFuncParam->SetArrayField("flags", GetPropertyFlags(FunctionProperty));
				Params.Add(MakeShared<FJsonValueObject>(FJsonValueObject(JFuncParam)));
			}
			JFunc->SetArrayField("parameters", Params);
			Functions.Add(MakeShared<FJsonValueObject>(FJsonValueObject(JFunc)));
		}
	}
	ClassInfo->SetArrayField("properties", Props);
	ClassInfo->SetArrayField("functions", Functions);
	return MakeShared<FJsonObject>(*ClassInfo);
}

void FTaskProcessor::ProcessTask(TSharedPtr< FGenTask > InTask)
{
	/********** Lambdas for the game thread to execute **********/
	
	
	
	auto GameThread_InitDocGen = [this](FString const& DocTitle, FString const& IntermediateDir) -> bool
	{
		Current->Task->Notification->SetExpireDuration(2.0f);
		Current->Task->Notification->SetText(LOCTEXT("DocGenInProgress", "Generation in progress..."));

		return Current->DocGen->GT_Init(DocTitle, IntermediateDir, Current->Task->Settings.BlueprintContextClass);
	};

	TFunction<void()> GameThread_EnqueueEnumerators = [this]()
	{
		// @TODO: Specific class enumerator
		Current->Enumerators.Enqueue(MakeShareable< FCompositeEnumerator< FNativeModuleEnumerator > >(new FCompositeEnumerator< FNativeModuleEnumerator >(Current->Task->Settings.NativeModules)));

		TArray< FName > ContentPackagePaths;
		for (auto const& Path : Current->Task->Settings.ContentPaths)
		{
			ContentPackagePaths.AddUnique(FName(*Path.Path));
		}
		Current->Enumerators.Enqueue(MakeShareable< FCompositeEnumerator< FContentPathEnumerator > >(new FCompositeEnumerator< FContentPathEnumerator >(ContentPackagePaths)));
	};

	auto GameThread_EnumerateNextObject = [this]() -> bool
	{
		Current->SourceObject.Reset();
		Current->CurrentSpawners.Empty();

		while(auto Obj = Current->CurrentEnumerator->GetNext())
		{
			// Ignore if already processed
			if(Current->Processed.Contains(Obj))
			{
				continue;
			}
			
			if (Obj->IsA(UBlueprint::StaticClass()))
			{
				UBlueprint* BP = Cast<UBlueprint>(Obj);
				UClass* Class = BP->GeneratedClass.Get();
				if (Class && ProcessClass(Class))
					Classes.Add(MakeShared<FJsonValueObject>(FJsonValueObject(SerializeClassInfo(Class))));
			}


			// Cache list of spawners for this object
			auto& BPActionMap = FBlueprintActionDatabase::Get().GetAllActions();
			if(auto ActionList = BPActionMap.Find(Obj))
			{
				if(ActionList->Num() == 0)
				{
					continue;
				}

				Current->SourceObject = Obj;
				for(auto Spawner : *ActionList)
				{
					// Add to queue as weak ptr
					check(Current->CurrentSpawners.Enqueue(Spawner));
				}
				
				// Done
				Current->Processed.Add(Obj);
				return true;
			}
		}

		// This enumerator is finished
		return false;
	};

	auto GameThread_EnumerateNextNode = [this](FDocumentationGenerator::FNodeProcessingState& OutState) -> UK2Node*
	{
		// We've just come in from another thread, check the source object is still around
		if(!Current->SourceObject.IsValid())
		{
			UE_LOG(LogCTRLDocumentable, Warning, TEXT("Object being enumerated expired!"));
			return nullptr;
		}

		// Try to grab the next spawner in the cached list
		TWeakObjectPtr< UBlueprintNodeSpawner > Spawner;
		while(Current->CurrentSpawners.Dequeue(Spawner))
		{
			if (Current->SourceObject.Get()->IsA(UAnimBlueprint::StaticClass()))
			{
				continue;
			}
			if(Spawner.IsValid())
			{
				// See if we can document this spawner
				auto K2_NodeInst = Current->DocGen->GT_InitializeForSpawner(Spawner.Get(), Current->SourceObject.Get(), OutState);

				if(K2_NodeInst == nullptr)
				{
					continue;
				}

				// Make sure this node object will never be GCd until we're done with it.
				K2_NodeInst->AddToRoot();
				return K2_NodeInst;
			}
		}

		// No spawners left in the queue
		return nullptr;
	};

	auto GameThread_FinalizeDocs = [this](FString const& OutputPath) -> bool
	{
		bool const Result = Current->DocGen->GT_Finalize(OutputPath);

		if (!Result)
		{
			Current->Task->Notification->SetText(LOCTEXT("DocFinalizationFailed", "Generation failed"));
			Current->Task->Notification->SetCompletionState(SNotificationItem::CS_Fail);
			Current->Task->Notification->ExpireAndFadeout();
			//GEditor->PlayEditorSound(CompileSuccessSound);
		}

		return Result;
	};

	/*****************************/


	Current = MakeUnique< FGenCurrentTask >();
	Current->Task = InTask;

	FString IntermediateDir = FPaths::ProjectIntermediateDir() / TEXT("CTRLDocumentable") / Current->Task->Settings.DocumentationTitle;

	CTRLDocumentable::RunOnGameThread(GameThread_EnqueueEnumerators);	

	// Initialize the doc generator
	Current->DocGen = MakeUnique< FDocumentationGenerator >();

	if(!CTRLDocumentable::RunOnGameThreadRetVal(GameThread_InitDocGen, Current->Task->Settings.DocumentationTitle, IntermediateDir))
	{
		UE_LOG(LogCTRLDocumentable, Error, TEXT("Failed to initialize generator!"));
		return;
	}

	bool const bCleanIntermediate = true;
	if(bCleanIntermediate)
	{
		IFileManager::Get().DeleteDirectory(*IntermediateDir, false, true);
	}

	int SuccessfulNodeCount = 0;
	while(Current->Enumerators.Dequeue(Current->CurrentEnumerator))
	{
		while(CTRLDocumentable::RunOnGameThreadRetVal(GameThread_EnumerateNextObject))	// Game thread: Enumerate next Obj, get spawner list for Obj, store as array of weak ptrs.
			{
			if(bTerminationRequest)
			{
				return;
			}

			FDocumentationGenerator::FNodeProcessingState NodeState;
			while(auto NodeInst = CTRLDocumentable::RunOnGameThreadRetVal(GameThread_EnumerateNextNode, NodeState))	// Game thread: Get next still valid spawner, spawn node, add to root, return it)
				{
				// NodeInst should hopefully not reference anything except stuff we control (ie graph object), and it's rooted so should be safe to deal with here

				// Generate image
				if(!Current->DocGen->GenerateNodeImage(NodeInst, NodeState))
				{
					UE_LOG(LogCTRLDocumentable, Warning, TEXT("Failed to generate node image!"))
					continue;
				}

				FJsonObject NodeMeta;

				// Generate doc
				if(!Current->DocGen->GenerateNodeDocs(NodeInst, NodeState, NodeMeta))
				{
					UE_LOG(LogCTRLDocumentable, Warning, TEXT("Failed to generate node doc xml!"))
					continue;
				}
				

				for (int i = 0; i < Classes.Num(); i++)
				{
					FString ClassName = Classes[i]->AsObject()->GetStringField(TEXT("className"));
					FString ClassId = NodeMeta.GetStringField(TEXT("classId"));
					if ( ClassName.Equals(ClassId, ESearchCase::IgnoreCase))
					{
						TArray<TSharedPtr<FJsonValue>> Nodes;
						if (Classes[i]->AsObject()->HasField(TEXT("nodes")))
						{
							Nodes = Classes[i]->AsObject()->GetArrayField(TEXT("nodes"));
						}
						Nodes.Add(MakeShared<FJsonValueObject>(MakeShared<FJsonObject>(NodeMeta)));
						Classes[i]->AsObject()->SetArrayField("nodes", Nodes);
					}
				}
				

				++SuccessfulNodeCount;
				}
			}
	}

	if(SuccessfulNodeCount == 0)
	{
		UE_LOG(LogCTRLDocumentable, Error, TEXT("No nodes were found to document!"));

		CTRLDocumentable::RunOnGameThread([this]
			{
				Current->Task->Notification->SetText(LOCTEXT("DocFinalizationFailed", "Generation failed - No nodes found"));
				Current->Task->Notification->SetCompletionState(SNotificationItem::CS_Fail);
				Current->Task->Notification->ExpireAndFadeout();
			});
		//GEditor->PlayEditorSound(CompileSuccessSound);
		return;
	}
	
	FString JsonString;
	FJsonObject* Nodes = new FJsonObject;
	Nodes->SetArrayField("nodes", Classes);
	FJsonSerializer::Serialize(MakeShared<FJsonObject>(*Nodes), TJsonWriterFactory<>::Create(&JsonString, 0));

	
	FFileHelper::SaveStringToFile(JsonString, *(FPaths::Combine(IPluginManager::Get().FindPlugin("CTRLDocumentable")->GetBaseDir() +"/ThirdParty/Web/src/data") + "/nodes.json"), FFileHelper::EEncodingOptions::ForceUTF8);
	CTRLDocumentable::RunDetached([this]
	{
		if (Current->Task->Settings.StartNodeServer == true)
		{
			FString WorkingDir = FPaths::Combine(IPluginManager::Get().FindPlugin("CTRLDocumentable")->GetBaseDir() + "/ThirdParty/Web");
			if (!FPaths::DirectoryExists(FPaths::Combine(WorkingDir, "node_modules")))
			{
				CTRLDocumentable::RunOnGameThread([this]
				{
					Current->Task->Notification->SetText(FText::FromString("Installing node modules"));
					Current->Task->Notification->SetExpireDuration(3600);
				});
				void* PipeWrite = nullptr;
				FProcHandle Proc = FPlatformProcess::CreateProc(
					TEXT("C:\\Windows\\System32\\cmd.exe"),
					TEXT("/c \"npm i\""),
					true,
					true,
					true,
					nullptr,
					0,
					*WorkingDir,
					PipeWrite
				);
				for(bool bProcessFinished = false; !bProcessFinished; )
				{
					bProcessFinished = !FPlatformProcess::IsProcRunning(Proc);
					
					if(bTerminationRequest)
					{
						FPlatformProcess::TerminateProc(Proc, true);
						bProcessFinished = true;
						return;
					}
				}
			}
			
			void* PipeWrite = nullptr;
			FProcHandle Proc = FPlatformProcess::CreateProc(
				TEXT("C:\\Windows\\System32\\cmd.exe"),
				TEXT("/c \"set port=3012 && npm start\""),
				true,
				false,
				false,
				nullptr,
				0,
				*WorkingDir,
				PipeWrite
			);
		}
		CTRLDocumentable::RunOnGameThread([this]
		{
			Current->Task->Notification->SetText(LOCTEXT("DocConversionSuccessful", "Generation complete!"));
			Current->Task->Notification->SetCompletionState(SNotificationItem::CS_Success);
			Current->Task->Notification->ExpireAndFadeout();
		});
		Current.Reset();
	});

}

FTaskProcessor::EIntermediateProcessingResult FTaskProcessor::ProcessIntermediateDocs(FString const& IntermediateDir, FString const& OutputDir, FString const& DocTitle, bool bCleanOutput)
{
	auto& PluginManager = IPluginManager::Get();
	auto Plugin = PluginManager.FindPlugin(TEXT("CTRLDocumentable"));
	if(!Plugin.IsValid())
	{
		UE_LOG(LogCTRLDocumentable, Error, TEXT("Failed to locate plugin info"));
		return EIntermediateProcessingResult::UnknownError;
	}

	const FString DocGenToolBinPath = Plugin->GetBaseDir() / TEXT("ThirdParty") / TEXT("DocProcessor") / TEXT("bin");
	const FString DocGenToolExeName = TEXT("DocProcessor.exe");
	const FString DocGenToolPath = DocGenToolBinPath / DocGenToolExeName;

	// Create a read and write pipe for the child process
	void* PipeRead = nullptr;
	void* PipeWrite = nullptr;
	verify(FPlatformProcess::CreatePipe(PipeRead, PipeWrite));

	FString Args =
		FString(TEXT("-outputdir=")) + TEXT("\"") + OutputDir + TEXT("\"")
		+ TEXT(" -fromintermediate -intermediatedir=") + TEXT("\"") + IntermediateDir + TEXT("\"")
		+ TEXT(" -projectdir=") + TEXT("\"") + FPaths::ProjectDir() + TEXT("\"")
		+ TEXT(" -name=") + DocTitle
		+ (bCleanOutput ? TEXT(" -cleanoutput") : TEXT(""))
		;
	UE_LOG(LogCTRLDocumentable, Log, TEXT("Invoking conversion tool: %s %s"), *DocGenToolPath, *Args);
	FProcHandle Proc = FPlatformProcess::CreateProc(
		*DocGenToolPath,
		*Args,
		true,
		false,
		false,
		nullptr,
		0,
		nullptr,
		PipeWrite
	);

	int32 ReturnCode = 0;
	if(Proc.IsValid())
	{
		FString BufferedText;
		for(bool bProcessFinished = false; !bProcessFinished; )
		{
			bProcessFinished = FPlatformProcess::GetProcReturnCode(Proc, &ReturnCode);
			

			/*			if(!bProcessFinished && Warn->ReceivedUserCancel())
			{
			FPlatformProcess::TerminateProc(ProcessHandle);
			bProcessFinished = true;
			}
			*/
			BufferedText += FPlatformProcess::ReadPipe(PipeRead);

			int32 EndOfLineIdx;
			while(BufferedText.FindChar('\n', EndOfLineIdx))
			{
				FString Line = BufferedText.Left(EndOfLineIdx);
				Line.RemoveFromEnd(TEXT("\r"));

				UE_LOG(LogCTRLDocumentable, Log, TEXT("[CTRLDocumentable] %s"), *Line);

				BufferedText = BufferedText.Mid(EndOfLineIdx + 1);
			}

			FPlatformProcess::Sleep(0.1f);
		}

		//FPlatformProcess::WaitForProc(Proc);
		//FPlatformProcess::GetProcReturnCode(Proc, &ReturnCode);
		FPlatformProcess::CloseProc(Proc);
		Proc.Reset();

		if(ReturnCode != 0)
		{
			UE_LOG(LogCTRLDocumentable, Error, TEXT("DocProcessor failed (code %i), see above output."), ReturnCode);
		}
	}

	// Close the pipes
	FPlatformProcess::ClosePipe(0, PipeRead);
	FPlatformProcess::ClosePipe(0, PipeWrite);

	switch(ReturnCode)
	{
		case 0:
		return EIntermediateProcessingResult::Success;
		case -1:
		return EIntermediateProcessingResult::UnknownError;
		case -2:
		return EIntermediateProcessingResult::DiskWriteFailure;
		default:
		return EIntermediateProcessingResult::SuccessWithErrors;
	}
}

TArray<TSharedPtr<FJsonValue>> FTaskProcessor::GetPropertyFlags(const FProperty* Property)
{
	TArray<TSharedPtr<FJsonValue>> Output;

	if (const auto Map = Property->GetMetaDataMap())
	{
		for (auto& KeyValue : *Map)
		{
			if (KeyValue.Value.IsEmpty())
			{
				Output.Add(MakeShared<FJsonValueString>(FJsonValueString(KeyValue.Key.ToString())));
			}
			else
			{
				FString Meta = FString::Printf(TEXT("%ls = %ls"), *KeyValue.Key.ToString(), *KeyValue.Value);
				Output.Add(MakeShared<FJsonValueString>(FJsonValueString(Meta)));
			}
		}
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_NativeAccessSpecifierPublic))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Public")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_NativeAccessSpecifierProtected))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Protected")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_NativeAccessSpecifierPrivate))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Private")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_EditorOnly))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("EditorOnly")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_BlueprintReadOnly))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintReadOnly")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_BlueprintAssignable))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintAssignable")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_BlueprintVisible))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintVisible")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_BlueprintCallable))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintCallable")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_BlueprintAuthorityOnly))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintAuthorityOnly")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_Deprecated))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Deprecated")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_ExposeOnSpawn))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("ExposeOnSpawn")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_Edit))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Edit")));
	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_EditConst))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("EditConst")));
	}
	
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_Config))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Config")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_SaveGame))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("SaveGame")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_GlobalConfig))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("GlobalConfig")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_Config))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Config")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_Parm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Parm")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_OutParm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("OutParm")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_ConstParm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("ConstParm")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_RequiredParm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("RequiredParm")));
	}

	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_ReferenceParm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("ReferenceParm")));

	}
	if (Property->HasAnyPropertyFlags(EPropertyFlags::CPF_ReturnParm))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("ReturnParm")));

	}
	return Output;
}

TArray<TSharedPtr<FJsonValue>> FTaskProcessor::GetFunctionFlags(const UFunction* Function)
{
	TArray<TSharedPtr<FJsonValue>> Output;
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Final))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Final")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_RequiredAPI))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("RequiredAPI")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_BlueprintAuthorityOnly))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintAuthorityOnly")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_BlueprintCosmetic))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintCosmetic")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_NetReliable))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("NetReliable")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Exec))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Exec")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Native))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Native")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Event))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Event")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Static))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Static")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_NetMulticast))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("NetMulticast")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_MulticastDelegate))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("MulticastDelegate")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Public))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Public")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Private))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Private")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Protected))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Protected")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Delegate))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Delegate")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_HasOutParms))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("HasOutParams")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_HasDefaults))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("HasDefaults")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_NetClient))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("NetClient")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_DLLImport))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("DLLImport")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_BlueprintCallable))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintCallable")));

	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_BlueprintEvent))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintEvent")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_BlueprintPure))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("BlueprintPure")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_EditorOnly))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("EditorOnly")));
	}
	if (Function->HasAnyFunctionFlags(EFunctionFlags::FUNC_Const))
	{
		Output.Add(MakeShared<FJsonValueString>(FJsonValueString("Const")));
	}
	return Output;
}

#undef LOCTEXT_NAMESPACE



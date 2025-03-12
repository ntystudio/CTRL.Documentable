// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2025 NTY.studio. All Rights Reserved.

#pragma once

#include "Modules/ModuleManager.h"
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"


class UClass;
class UBlueprint;
class UEdGraph;
class UEdGraphNode;
class UK2Node;
class UBlueprintNodeSpawner;
class FXmlFile;
class FXmlNode;
class FDocumentationGenerator
{
public:
	FDocumentationGenerator()
	{}
	~FDocumentationGenerator();

public :
	struct FNodeProcessingState
	{
		FString RelImageBasePath;
		FString ImageFilename;
		UClass  *AssociatedClass;
		FNodeProcessingState():
			RelImageBasePath(),
			ImageFilename()
		{}
	};

public:
	/** Callable only from game thread */
	bool GT_Init(FString const& InDocsTitle, FString const& InOutputDir, UClass* BlueprintContextClass = AActor::StaticClass());
	UK2Node* GT_InitializeForSpawner(UBlueprintNodeSpawner* Spawner, UObject* SourceObject, FNodeProcessingState& OutState);
	bool GT_Finalize(FString OutputPath);
	/**/

	/** Callable from background thread */
	bool GenerateNodeImage(UEdGraphNode* Node, FNodeProcessingState& State);
	bool GenerateNodeDocs(UK2Node* Node, FNodeProcessingState& State, FJsonObject& ObjectMeta);
	/**/

protected:
	void CleanUp();

	FString GetFunctionFlags(UFunction *InFunction);
	FString ExtractFunctionDescription(const FString& FunctionTooltip);
	FString ExtractFunctionParamDescription(const FString &FunctionTooltip, const FString &ParamName, const FString& DefaultTooltip, bool ExtractReturnInfo = false);
	FString JoinArrayOfStrings(const TArray<FString>& Array, int Start = 0, bool AddLineEndings = true);
	static void AdjustNodeForSnapshot(UEdGraphNode* Node);
	static FString GetClassDocId(UClass* Class);
	static FString GetNodeDocId(UEdGraphNode* Node);
	static UClass* MapToAssociatedClass(UK2Node* NodeInst, UObject* Source);
	static bool IsSpawnerDocumentable(UBlueprintNodeSpawner* Spawner, bool bIsBlueprint);

protected:
	TWeakObjectPtr< UBlueprint > DummyBP;
	TWeakObjectPtr< UEdGraph > Graph;
	TSharedPtr< class SGraphPanel > GraphPanel;

	FString DocsTitle;
	FString OutputDir;

public:
	//
	double GenerateNodeImageTime = 0.0;
	double GenerateNodeDocsTime = 0.0;
	double GenerateFuncDocsTime = 0.0;
	//
};



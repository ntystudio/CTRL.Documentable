// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2025 NTY.studio. All Rights Reserved.

#pragma once

#include "UObject/UnrealType.h"
#include "Engine/EngineTypes.h"
#include "UObject/ObjectMacros.h"
#include "GameFramework/Actor.h"
#include "Misc/Paths.h"
#include "Misc/App.h"
#include "GenerationSettings.generated.h"


USTRUCT()
struct FGenerationSettings
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, Category = "Documentation")
	FString DocumentationTitle;

	UPROPERTY(EditAnywhere, Category = "Documentation" )
	bool StartNodeServer;
		
	/** List of C++ modules in which to search for blueprint-exposed classes to document. */
	UPROPERTY(EditAnywhere, Category = "Class Search", Meta = (Tooltip = "Raw module names (Do not prefix with '/Script')."))
	TArray< FName > NativeModules;

	/** List of paths in which to search for blueprints to document. */
	UPROPERTY(EditAnywhere, Category = "Class Search", Meta = (ContentDir))//, Meta = (Tooltip = "Path to content subfolder, e.g. '/Game/MyFolder' or '/PluginName/MyFolder'."))
	TArray< FDirectoryPath > ContentPaths;

	UPROPERTY(EditAnywhere, Category = "Class Search", AdvancedDisplay)
	TSubclassOf< UObject > BlueprintContextClass;

	


public:
	FGenerationSettings()
	{
		BlueprintContextClass = AActor::StaticClass();
	}

	bool HasAnySources() const
	{
		return NativeModules.Num() > 0
			|| ContentPaths.Num() > 0;
	}
};

UCLASS(Config = EditorPerProjectUserSettings)
class UGenerationSettingsObject: public UObject
{
	GENERATED_BODY()

public:
	static UGenerationSettingsObject* Get()
	{
		static bool bInitialized = false;

		// This is a singleton, use default object
		auto DefaultSettings = GetMutableDefault< UGenerationSettingsObject >();

		if(!bInitialized)
		{
			InitDefaults(DefaultSettings);

			bInitialized = true;
		}

		return DefaultSettings;
	}

	static void InitDefaults(UGenerationSettingsObject* CDO)
	{
		if(CDO->Settings.DocumentationTitle.IsEmpty())
		{
			CDO->Settings.DocumentationTitle = FApp::GetProjectName();
		}

		if (CDO->Settings.StartNodeServer == false)
		{
			CDO->Settings.StartNodeServer = true;
		}

		if(CDO->Settings.BlueprintContextClass == nullptr)
		{
			CDO->Settings.BlueprintContextClass = AActor::StaticClass();
		}
	}

public:
	UPROPERTY(EditAnywhere, Config, Category = "CTRLDocumentable", Meta = (ShowOnlyInnerProperties))
		FGenerationSettings Settings;
};


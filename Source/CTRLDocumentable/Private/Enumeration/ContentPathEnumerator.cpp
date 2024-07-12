// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#include "ContentPathEnumerator.h"
#include "CTRLDocumentableLog.h"
#include "Engine/Blueprint.h"
#include "Animation/AnimBlueprint.h"
#include "AssetRegistry/AssetRegistryModule.h"


FContentPathEnumerator::FContentPathEnumerator(
	FName const& InPath
)
{
	CurIndex = 0;

	Prepass(InPath);
}

void FContentPathEnumerator::Prepass(FName const& Path)
{
	auto& AssetRegistryModule = FModuleManager::GetModuleChecked< FAssetRegistryModule >("AssetRegistry");
	auto& AssetRegistry = AssetRegistryModule.Get();

	FARFilter Filter;
	Filter.bRecursiveClasses = true;
	// Filter.ClassNames.Add(UBlueprint::StaticClass()->GetFName());
	Filter.ClassPaths.Add(FTopLevelAssetPath(UBlueprint::StaticClass()->GetPathName()));
	
	// @TODO: Not sure about this, but for some reason was generating docs for 'AnimInstance' itself.
	// Filter.RecursiveClassesExclusionSet.Add(UAnimBlueprint::StaticClass()->GetFName());
	Filter.RecursiveClassPathsExclusionSet.Add(UAnimBlueprint::StaticClass()->GetClassPathName());
	
	AssetRegistry.GetAssetsByPath(Path, AssetList, true);
	AssetRegistry.RunAssetsThroughFilter(AssetList, Filter);
}

UObject* FContentPathEnumerator::GetNext()
{
	UObject* Result = nullptr;

	while(CurIndex < AssetList.Num())
	{
		auto const& AssetData = AssetList[CurIndex];
		++CurIndex;

		if (auto Struct = Cast<UScriptStruct>(AssetData.GetAsset()))
		{
			UE_LOG(LogCTRLDocumentable, Log, TEXT("Found new struct '%s' at '%s'"), *Struct->GetName(), *AssetData.ObjectPath.ToString());
		}

		if (auto Enum = Cast<UEnum>(AssetData.GetAsset()))
		{
			UE_LOG(LogCTRLDocumentable, Log, TEXT("Found new enum '%s' at '%s'"), *Enum->GetName(), *AssetData.ObjectPath.ToString());
		}

		if(auto Blueprint = Cast< UBlueprint >(AssetData.GetAsset()))
		{
			UE_LOG(LogCTRLDocumentable, Log, TEXT("Enumerating object '%s' at '%s'"), *Blueprint->GetName(), *AssetData.ObjectPath.ToString());

			Result = Blueprint;
			break;
		}
	}
	
	return Result;
}

float FContentPathEnumerator::EstimateProgress() const
{
	return (float)CurIndex / (AssetList.Num() - 1);
}

int32 FContentPathEnumerator::EstimatedSize() const
{
	return AssetList.Num();
}


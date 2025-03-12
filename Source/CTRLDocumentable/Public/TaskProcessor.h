// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#pragma once

#include "GenerationSettings.h"

#include "HAL/Runnable.h"
#include "HAL/ThreadSafeBool.h"
#include "UObject/WeakObjectPtrTemplates.h"
#include "Containers/Queue.h"
#include "CoreMinimal.h"
#include "DocumentationGenerator.h"

class ISourceObjectEnumerator;

class UBlueprintNodeSpawner;


class FTaskProcessor: public FRunnable
{
public:
	FTaskProcessor();

public:
	void QueueTask(FGenerationSettings const& Settings);
	bool IsRunning() const;
	static TArray<TSharedPtr<FJsonValue>> Classes;

public:
	virtual bool Init() override;
	virtual uint32 Run() override;
	virtual void Exit() override;
	virtual void Stop() override;
	virtual bool ProcessClass(UClass* Class);
	virtual TSharedRef<FJsonObject> SerializeClassInfo(UClass *Class); 

protected:
	struct FGenTask
	{
		FGenerationSettings Settings;
		TSharedPtr< class SNotificationItem > Notification;
	};

	struct FGenCurrentTask
	{
		TSharedPtr< FGenTask > Task;

		TQueue< TSharedPtr< ISourceObjectEnumerator > > Enumerators;
		TSet< FName > Excluded;
		TSet< TWeakObjectPtr< UObject > > Processed;

		TSharedPtr< ISourceObjectEnumerator > CurrentEnumerator;
		TWeakObjectPtr< UObject > SourceObject;
		TQueue< TWeakObjectPtr< UBlueprintNodeSpawner > > CurrentSpawners;

		TUniquePtr< FDocumentationGenerator > DocGen;
	};

	struct FOutputTask
	{
		TSharedPtr< FGenTask> Task;
	};

protected:
	void ProcessTask(TSharedPtr< FGenTask > InTask);
	static TArray<TSharedPtr<FJsonValue>> GetPropertyFlags(const FProperty* Property);
	static TArray<TSharedPtr<FJsonValue>> GetFunctionFlags(const UFunction* Function);

	enum EIntermediateProcessingResult: uint8 {
		Success,
		SuccessWithErrors,
		UnknownError,
		DiskWriteFailure,
	};

	EIntermediateProcessingResult ProcessIntermediateDocs(FString const& IntermediateDir, FString const& OutputDir, FString const& DocTitle, bool bCleanOutput);

protected:
	TQueue< TSharedPtr< FGenTask > > Waiting;
	TUniquePtr< FGenCurrentTask > Current;
	TQueue< TSharedPtr< FOutputTask > > Converting;
	TSet<UClass*> ProcessedClasses;
	FThreadSafeBool bRunning;	// @NOTE: Using this to sync with module calls from game thread is not 100% okay (we're not atomically testing), but whatevs.
	FThreadSafeBool bTerminationRequest;
	
};



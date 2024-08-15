// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "GenerateDocumentationCommandlet.generated.h"

/**
 * 
 */
	
DEFINE_LOG_CATEGORY_STATIC(LogDocGeneration, Log, All);
UCLASS()
class CTRLDOCUMENTABLE_API UGenerateDocumentationCommandlet : public UCommandlet
{
	GENERATED_BODY()

public:
	virtual void CreateCustomEngine(const FString& Params) override;

	UGenerateDocumentationCommandlet(const FObjectInitializer& ObjectInitializer);
	virtual int32 Main(const FString& Params) override;
};

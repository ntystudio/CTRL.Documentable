// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2025 NTY.studio. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GenerationSettings.h"
#include "TaskProcessor.h"
#include "Modules/ModuleManager.h"

class FUICommandList;


class FCTRLDocumentableModule : public IModuleInterface
{
public:

	/** IModuleInterface implementation */
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

public:
	void GenerateDocs(struct FGenerationSettings const& Settings);

protected:
	void ProcessIntermediateDocs(FString const& IntermediateDir, FString const& OutputDir, FString const& DocTitle, bool bCleanOutput);
	void ShowUI();

protected:
	TUniquePtr< FTaskProcessor > Processor;

	TSharedPtr< FUICommandList > UICommands;
};

// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#include "UEDocumentable.h"
#include "DocumentationGenerator.h"
#include "UEDocumentableCommands.h"
#include "UEDocumentableLog.h"
#include "TaskProcessor.h"
#include "UI/SDocGeneratorWidget.h"
#include "GenerationSettings.h"

#include "HAL/IConsoleManager.h"
#include "Interfaces/IMainFrameModule.h"
#include "LevelEditor.h"
#include "Framework/MultiBox/MultiBoxBuilder.h"
#include "Framework/Application/SlateApplication.h"
#include "HAL/RunnableThread.h"


#define LOCTEXT_NAMESPACE "FUEDocumentableModule"

IMPLEMENT_MODULE(FUEDocumentableModule, UEDocumentable)

DEFINE_LOG_CATEGORY(LogCTRLDocumentable);

void FUEDocumentableModule::StartupModule()
{
	// Create command list
	UICommands = MakeShareable< FUICommandList >(new FUICommandList);

	FUEDocumentableCommands::Register();

	// Map commands
	FUIAction ShowDocGenUI_UIAction(
		FExecuteAction::CreateRaw(this, &FUEDocumentableModule::ShowUI),
		FCanExecuteAction::CreateLambda([] { return true; })
	);

	auto CmdInfo = FUEDocumentableCommands::Get().ShowUI;
	UICommands->MapAction(CmdInfo, ShowDocGenUI_UIAction);

	// Setup menu extension
	auto AddMenuExtension = [](FMenuBuilder& MenuBuilder)
	{
		MenuBuilder.AddMenuEntry(FUEDocumentableCommands::Get().ShowUI);
	};

	auto& LevelEditorModule = FModuleManager::LoadModuleChecked< FLevelEditorModule >("LevelEditor");
	TSharedRef< FExtender > MenuExtender(new FExtender());
	MenuExtender->AddMenuExtension(
		TEXT("FileProject"),
		EExtensionHook::After,
		UICommands.ToSharedRef(),
		FMenuExtensionDelegate::CreateLambda(AddMenuExtension)
	);
	LevelEditorModule.GetMenuExtensibilityManager()->AddExtender(MenuExtender);
}

void FUEDocumentableModule::ShutdownModule()
{
	FUEDocumentableCommands::Unregister();
}


void FUEDocumentableModule::GenerateDocs(FGenerationSettings const& Settings)
{
	if (!Processor.IsValid())
	{
		Processor = MakeUnique< FTaskProcessor >();
	}

	Processor->QueueTask(Settings);

	if (!Processor->IsRunning())
	{
		FRunnableThread::Create(Processor.Get(), TEXT("UEDocumentableProcessorThread"), 0, TPri_BelowNormal);
	}
}

void FUEDocumentableModule::ProcessIntermediateDocs(FString const& IntermediateDir, FString const& OutputDir, FString const& DocTitle, bool bCleanOutput)
{
}

void FUEDocumentableModule::ShowUI()
{
	const FText WindowTitle = LOCTEXT("DocGenWindowTitle", "UE Documentable");

	TSharedPtr< SWindow > Window =
		SNew(SWindow)
		.Title(WindowTitle)
		.MinWidth(400.0f)
		.MinHeight(300.0f)
		.MaxHeight(600.0f)
		.SupportsMaximize(false)
		.SupportsMinimize(false)
		.SizingRule(ESizingRule::Autosized)
		;

	TSharedRef< SWidget > DocGenContent = SNew(SDocGeneratorWidget);
	Window->SetContent(DocGenContent);

	IMainFrameModule& MainFrame = FModuleManager::LoadModuleChecked< IMainFrameModule >("MainFrame");
	TSharedPtr< SWindow > ParentWindow = MainFrame.GetParentWindow();

	if (ParentWindow.IsValid())
	{
		FSlateApplication::Get().AddModalWindow(Window.ToSharedRef(), ParentWindow.ToSharedRef());

		auto Settings = UGenerationSettingsObject::Get();
		Settings->SaveConfig();
	}
	else
	{
		FSlateApplication::Get().AddWindow(Window.ToSharedRef());
	}
}

#undef LOCTEXT_NAMESPACE
	

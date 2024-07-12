// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#include "CTRLDocumentable.h"
#include "CTRLDocumentableCommands.h"
#include "CTRLDocumentableLog.h"
#include "TaskProcessor.h"
#include "UI/SDocGeneratorWidget.h"
#include "GenerationSettings.h"

#include "HAL/IConsoleManager.h"
#include "Interfaces/IMainFrameModule.h"
#include "LevelEditor.h"
#include "Framework/MultiBox/MultiBoxBuilder.h"
#include "Framework/Application/SlateApplication.h"
#include "HAL/RunnableThread.h"


#define LOCTEXT_NAMESPACE "FCTRLDocumentableModule"

IMPLEMENT_MODULE(FCTRLDocumentableModule, CTRLDocumentable)

DEFINE_LOG_CATEGORY(LogCTRLDocumentable);

void FCTRLDocumentableModule::StartupModule()
{
	// Create command list
	UICommands = MakeShareable< FUICommandList >(new FUICommandList);

	FCTRLDocumentableCommands::Register();

	// Map commands
	FUIAction ShowDocGenUI_UIAction(
		FExecuteAction::CreateRaw(this, &FCTRLDocumentableModule::ShowUI),
		FCanExecuteAction::CreateLambda([] { return true; })
	);

	auto CmdInfo = FCTRLDocumentableCommands::Get().ShowUI;
	UICommands->MapAction(CmdInfo, ShowDocGenUI_UIAction);

	// Setup menu extension
	auto AddMenuExtension = [](FMenuBuilder& MenuBuilder)
	{
		MenuBuilder.AddMenuEntry(FCTRLDocumentableCommands::Get().ShowUI);
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

void FCTRLDocumentableModule::ShutdownModule()
{
	FCTRLDocumentableCommands::Unregister();
}


void FCTRLDocumentableModule::GenerateDocs(FGenerationSettings const& Settings)
{
	if (!Processor.IsValid())
	{
		Processor = MakeUnique< FTaskProcessor >();
	}

	Processor->QueueTask(Settings);

	if (!Processor->IsRunning())
	{
		FRunnableThread::Create(Processor.Get(), TEXT("CTRLDocumentableProcessorThread"), 0, TPri_BelowNormal);
	}
}

void FCTRLDocumentableModule::ProcessIntermediateDocs(FString const& IntermediateDir, FString const& OutputDir, FString const& DocTitle, bool bCleanOutput)
{
}

void FCTRLDocumentableModule::ShowUI()
{
	const FText WindowTitle = LOCTEXT("DocGenWindowTitle", "CTRL Documentable");

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
	

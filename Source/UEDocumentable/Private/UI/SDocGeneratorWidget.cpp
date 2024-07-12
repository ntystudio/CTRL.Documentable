//This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.


#include "UI/SDocGeneratorWidget.h"
#include "UEDocumentable.h"

#include "PropertyEditorModule.h"
#include "IDetailsView.h"
#include "Widgets/SBoxPanel.h"
#include "Widgets/Input/SButton.h"
#include "Framework/Application/SlateApplication.h"

#define LOCTEXT_NAMESPACE "UEDocumentable"

void SDocGeneratorWidget::Construct(const SDocGeneratorWidget::FArguments& InArgs)
{
	auto& PropertyEditorModule = FModuleManager::LoadModuleChecked< FPropertyEditorModule >("PropertyEditor");

	FDetailsViewArgs DetailArgs;
	DetailArgs.bUpdatesFromSelection = false;
	DetailArgs.bLockable = false;
	DetailArgs.NameAreaSettings = FDetailsViewArgs::ComponentsAndActorsUseNameArea;
	DetailArgs.bCustomNameAreaLocation = false;
	DetailArgs.bCustomFilterAreaLocation = true;
	DetailArgs.DefaultsOnlyVisibility = EEditDefaultsOnlyNodeVisibility::Hide;

	auto DetailView = PropertyEditorModule.CreateDetailView(DetailArgs);

	ChildSlot
		[
			SNew(SVerticalBox)

			+ SVerticalBox::Slot()
		.AutoHeight()
		[
			DetailView
		]

	+ SVerticalBox::Slot()
		.AutoHeight()
		[
			SNew(SHorizontalBox)

			+ SHorizontalBox::Slot()
		.AutoWidth()
		[
			SNew(SButton)
			.Text(LOCTEXT("GenButtonLabel", "Generate Documentation"))
		.IsEnabled(this, &SDocGeneratorWidget::ValidateSettingsForGeneration)
		.OnClicked(this, &SDocGeneratorWidget::OnGenerateDocumentation)
		]
		]
		];

	auto Settings = UGenerationSettingsObject::Get();
	DetailView->SetObject(Settings);
}

bool SDocGeneratorWidget::ValidateSettingsForGeneration() const
{
	auto const& Settings = UGenerationSettingsObject::Get()->Settings;

	if (Settings.DocumentationTitle.IsEmpty())
	{
		return false;
	}

	if (!Settings.HasAnySources())
	{
		return false;
	}

	if (Settings.BlueprintContextClass == nullptr)
	{
		return false;
	}

	return true;
}

FReply SDocGeneratorWidget::OnGenerateDocumentation()
{
	auto& Module = FModuleManager::LoadModuleChecked<FUEDocumentableModule>(TEXT("UEDocumentable"));
	Module.GenerateDocs(UGenerationSettingsObject::Get()->Settings);

	TSharedRef< SWindow > ParentWindow = FSlateApplication::Get().FindWidgetWindow(AsShared()).ToSharedRef();
	FSlateApplication::Get().RequestDestroyWindow(ParentWindow);

	return FReply::Handled();
}

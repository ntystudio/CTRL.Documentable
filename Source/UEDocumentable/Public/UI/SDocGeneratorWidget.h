//This Source Code Form is subject to the terms of the Mozilla Public
//License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2021 Notion Theory LLC. All Rights Reserved.

#pragma once

#include "Widgets/SCompoundWidget.h"
#include "Widgets/DeclarativeSyntaxSupport.h"

/**
 * 
 */
class UEDOCUMENTABLE_API SDocGeneratorWidget : public SCompoundWidget
{
public:
	SLATE_BEGIN_ARGS(SDocGeneratorWidget)
	{}

	SLATE_END_ARGS()

		void Construct(const SDocGeneratorWidget::FArguments& InArgs);

protected:
	bool ValidateSettingsForGeneration() const;
	FReply OnGenerateDocumentation();

protected:

};
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2024 NTY.studio. All Rights Reserved.

#pragma once

#include "Framework/Commands/Commands.h"
#include "Editor/EditorStyle/Public/EditorStyleSet.h"


class FCTRLDocumentableCommands : public TCommands< FCTRLDocumentableCommands >
{
public:
	FCTRLDocumentableCommands() : TCommands< FCTRLDocumentableCommands >
	(
		"CTRLDocumentable", // Context name for fast lookup
		NSLOCTEXT("Contexts", "CTRLDocumentable", "Documentation"), // Localized context name for displaying
		NAME_None, // Parent
		FAppStyle::GetAppStyleSetName() // Icon Style Set
		// FEditorStyle::GetStyleSetName() // Icon Style Set
	)
	{
	}
	
	/**
	 * Initialize commands
	 */
	virtual void RegisterCommands() override;

public:
	// Mode Switch
	TSharedPtr< FUICommandInfo > ShowUI;

	// Map
	TMap< FName, TSharedPtr< FUICommandInfo > > CommandMap;
};



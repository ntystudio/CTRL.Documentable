// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.


// Copyright (C) 2021 Notion Theory LLC. All Rights Reserved.

#include "UEDocumentableCommands.h"


#define LOCTEXT_NAMESPACE "UEDocumentable"


void FUEDocumentableCommands::RegisterCommands()
{
	UI_COMMAND(ShowUI, "Documentation", "Shows documentation generator window", EUserInterfaceActionType::Button, FInputGesture());
	CommandMap.Add(TEXT("ShowUI"), ShowUI);
}


#undef LOCTEXT_NAMESPACE



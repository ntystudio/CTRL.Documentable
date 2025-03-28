// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (C) 2023-2025 NTY.studio. All Rights Reserved.

#include "CTRLDocumentableCommands.h"


#define LOCTEXT_NAMESPACE "CTRLDocumentable"


void FCTRLDocumentableCommands::RegisterCommands()
{
	UI_COMMAND(ShowUI, "CTRL Documentable", "Open the CTRL Documentable documentation generator window", EUserInterfaceActionType::Button, FInputGesture());
	CommandMap.Add(TEXT("ShowUI"), ShowUI);
}


#undef LOCTEXT_NAMESPACE



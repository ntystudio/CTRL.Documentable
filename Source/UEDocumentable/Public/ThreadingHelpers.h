// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.


// Copyright (C) 2021 Notion Theory LLC. All Rights Reserved.

#pragma once

#include "Async/TaskGraphInterfaces.h"


namespace UEDocumentable
{

	template < typename TLambda >
	inline auto RunOnGameThread(TLambda Func) -> void
	{
		FGraphEventRef Task = FFunctionGraphTask::CreateAndDispatchWhenReady(MoveTemp(Func), TStatId(), nullptr, ENamedThreads::GameThread);
		FTaskGraphInterface::Get().WaitUntilTaskCompletes(Task);
	}

	template < typename TLambda, typename... TArgs >
	inline auto RunOnGameThreadRetVal(TLambda Func, TArgs&... Args) -> decltype(Func(Args...))
	{
		typedef decltype(Func(Args...)) TResult;

		TResult Result;
		TFunction<void()> NullaryFunc = [&]
		{
			Result = Func(Args...);
		};

		FGraphEventRef Task = FFunctionGraphTask::CreateAndDispatchWhenReady(NullaryFunc, TStatId(), nullptr, ENamedThreads::GameThread);
		FTaskGraphInterface::Get().WaitUntilTaskCompletes(Task);

		return Result;
	}

}


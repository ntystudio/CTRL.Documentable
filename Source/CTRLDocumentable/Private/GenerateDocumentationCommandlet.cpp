// Fill out your copyright notice in the Description page of Project Settings.


#include "GenerateDocumentationCommandlet.h"

#include "CTRLDocumentable.h"
#include "DummyViewport.h"
#include "GenerationSettings.h"
#include "StandaloneRenderer.h"
#include "StandaloneRenderer.h"
#include "NUTUtil.h"
#include "Engine/GameEngine.h"


void UGenerateDocumentationCommandlet::CreateCustomEngine(const FString& Params)
{
#if !IS_MONOLITHIC
	FSlateApplication::InitializeAsStandaloneApplication(GetStandardStandaloneRenderer());
#endif
}

UGenerateDocumentationCommandlet::UGenerateDocumentationCommandlet(const FObjectInitializer& ObjectInitializer)
: Super(ObjectInitializer)
{
	IsClient = false;

	IsServer = false;
	IsEditor = true;

	LogToConsole = true;
	ShowErrorCount = true;
	ShowProgress = true;
	
	// IsServer = false;
	// IsClient = false;
	// IsEditor = true;
	// LogToConsole = true;
}

int32 UGenerateDocumentationCommandlet::Main(const FString& Params)
{
	TFunction<void()> Task = []()
	{
		// GameInstace = GameEngine->GameInstance;
		UWorld* World = GEngine->GetWorldContexts()[0].World(); 
		
		if (!World)
		{
			UE_LOG(LogTemp, Error, TEXT("Failed to find or create a valid UWorld instance."));
			return;
		}
		// // Initialize the engine with rendering support
		GEngine->Start();
		//
		// // Initialize the renderer, this is key to ensuring the GameThread can access rendering resources
		// FSlateApplication::InitializeAsStandaloneApplication(GetStandardStandaloneRenderer());

		if (!GEditor)
        {
            GEditor = NewObject<UEditorEngine>(UEditorEngine::StaticClass());
            GEditor->InitEditor(GEngine->EngineLoop);
        }
		
		if (!IsEngineExitRequested())
		{
			GIsRunning = true;

			// Hack-set the engine GameViewport, so that setting GIsClient, doesn't cause an auto-exit
			// @todo JohnB: If you later remove the GIsClient setting code below, remove this as well
			if (GEngine->GameViewport == nullptr)
			{
				UEditorEngine* EditorEngine = Cast<UEditorEngine>(GEngine);

				if (EditorEngine != nullptr)
				{
					UGameInstance* GameInstance = World->GetGameInstance();
					UGameViewportClient* NewViewport = NewObject<UGameViewportClient>(EditorEngine);
					FWorldContext* CurContext = GEngine->GetWorldContextFromWorld(World);

					EditorEngine->GameViewport = NewViewport;
					NewViewport->Init(*CurContext, GameInstance);

					// Set the overlay widget, to avoid an ensure
					TSharedRef<SOverlay> DudOverlay = SNew(SOverlay);

					NewViewport->SetViewportOverlayWidget(nullptr, DudOverlay);

					// Set the internal FViewport, for the new game viewport, to avoid another bit of auto-exit code
					NewViewport->Viewport = new FDummyViewport(NewViewport);

					// Set the main engine world context game viewport, to match the newly created viewport, in order to prevent crashes
					CurContext->GameViewport = NewViewport;
				}
			}


			// Now, after init stages are done, enable GIsClient for netcode and such
			GIsClient = true;

			// Required for the unit test commandlet
			PRIVATE_GAllowCommandletRendering = true;
			
			// PRIVATE_GAllowCommandletRendering = true;
			//

			//
			// // Make sure the rendering thread is initialized
			// ENQUEUE_RENDER_COMMAND(InitializeRenderThread)(
			// 	[](FRHICommandListImmediate& RHICmdList)
			// 	{
			// 		// This ensures the rendering thread is ready
			// 	}
			// );
			// FlushRenderingCommands();

			UE_LOG(LogDocGeneration, Warning, TEXT("Documentation generation process was activated"));
			auto& Module = FModuleManager::LoadModuleChecked<FCTRLDocumentableModule>(TEXT("CTRLDocumentable"));
			Module.GenerateDocs(UGenerationSettingsObject::Get()->Settings);

			// Shutdown Slate application when done
			FSlateApplication::Shutdown();
		}
	};

	//Async(EAsyncExecution::TaskGraphMainThread, Task);

	// Wait for the GameThread to complete the task
	FGraphEventRef TaskDone = FFunctionGraphTask::CreateAndDispatchWhenReady(Task, TStatId(), nullptr, ENamedThreads::GameThread);
	FTaskGraphInterface::Get().WaitUntilTaskCompletes(TaskDone);
		

	
	return 0;
}

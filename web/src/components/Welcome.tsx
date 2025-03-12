import {FC} from 'react';
import {Separator} from "./ui/separator";

const WelcomePage: FC = () => {
    return (
        <section className="w-full">
            <div className="max-w-[700px] mx-auto h-screen flex flex-col justify-center">
                <div className="p-5 border-2 rounded-lg">
                    <img src="/ctrl-documentable-logo.png" alt="Logo of the CTRL Documentable plugin"
                         className="w-full max-w-[300px] rounded-lg"/>
                    <p className="mt-4">CTRL Documentable is part of the <a href="https://nty.studio"
                                                                                       target="_blank"
                                                                                       className="underline">NTY.studio</a> CTRL
                        Framework, a library of utility plugins for Unreal Engine.</p>
                </div>
                <Separator className="my-8"/>
                <h3 className="text-xl font-bold">Feedback</h3>
                <p className="text-base">
                    If you come across an issue while using the plugin or have a suggestion to improve the plugin, feel
                    free to <a href="https://github.com/ntystudio/CTRL-documentable/issues"
                               target="_blank"
                               className="underline">open an issue.</a>
                </p>
                <Separator className="my-8"/>
                <h3 className="text-xl font-bold">Discord</h3>
                <p className="text-base">
                    Join our <a href="https://discord.gg/ntystudio"
                                target="_blank"
                                className="underline">discord community</a> to get the latest updates on the plugin,
                    discover other CTRL Framework tools, and get help from other community members.
                </p>
            </div>
        </section>
    );
};

export default WelcomePage;

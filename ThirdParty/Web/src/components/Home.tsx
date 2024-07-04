import {FC} from 'react';

const HomePage: FC = () => {
    return (
        <section className="w-full bg-yellow">
            <div className="p-4">
                <div className="w-full p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700">
                    <h1>this is loading the content</h1>
                </div>
            </div>
        </section>
    );
};

export default HomePage;

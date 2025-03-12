import React, {FC} from 'react';

type Props = {
    text: string
}
export const EmptyContainer: FC<Props> = (props) => {
    const {text} = props;
    return (
        <div className="w-full p-4 border-2 border-light-color-base-30 dark:border-dark-color-base-30 bg-light-color-base-20 dark:bg-dark-color-base-20 rounded-md">
            <p className="text-light-color-yellow dark:text-dark-color-yellow">
                {text}
            </p>
        </div>
    );
};

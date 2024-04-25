import React, {FC, useCallback} from 'react';
import {NodeConfig} from '../../types/types';
import {useNavigate} from 'react-router-dom';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {LinkIcon} from '../../components/UI/icons/LinkIcon';

interface NodeItemProps {
    node: NodeConfig;
}

export const NodeItem: FC<NodeItemProps> = ({
        node: {
            classId,
            className,
            description,
            docsName,
            fullTitle,
            imgPath,
            inputs,
            outputs,
            shortTitle,
        },
    }) => {
    const {setSelectedNode} = useSelectedClass();
    const navigate = useNavigate();

    /*
      we're using useCallback here because we're passing this function to a child component,
      and we don't want the child component to re-render every time this function is called
     */
    const selectNodeHandler = useCallback(() => {
        setSelectedNode({classId, className, description, docsName, fullTitle, imgPath, inputs, outputs, shortTitle});
        navigate(`/class/${className}/node/${fullTitle}`);
    }, [classId, className, description, docsName, fullTitle, imgPath, inputs, outputs, shortTitle, setSelectedNode, navigate]);

    return (
        <>
            <td className="w-1/3 nty-td">
                <div className="text-md text-dark-color-base-20 dark:text-light-color-base-20">
                    <button onClick={selectNodeHandler} className="font-mono nty-text-link-std">
                        <LinkIcon className="text-current" />
                        <span className="ml-1 text-left">{fullTitle}</span>
                    </button>
                </div>
            </td>
            <td className="w-2/3 nty-td">
                <div className="nty-text-body-std">
                    {description === '' ?
                        <span className="nty-zero-state-text">No description provided</span> : description}
                </div>
            </td>
        </>
    );
};

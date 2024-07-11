import React, {useState, ReactNode} from 'react';
import {Icon} from '@iconify/react';
import {twMerge} from 'tailwind-merge';
import {motion} from 'framer-motion';

interface AccordionItemProps {
    hiddenContent: ReactNode; // Now accepts a ReactNode
    title: ReactNode;
    className?: string;
    visibleClassName?: string;
    hiddenClassName?: string;
    defaultOpen?: boolean;
}

export const Expandable: React.FC<AccordionItemProps> = ({
                                                             hiddenContent,
                                                             title,
                                                             className,
                                                             hiddenClassName,
                                                             visibleClassName,
                                                             defaultOpen = false,
                                                         }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div
            id="accordion-collapse"
            data-accordion="collapse"
            className={twMerge(['relative w-full overflow-hidden', className])}
        >
            <div
                className={twMerge('flex pl-6 items-center w-full gap-3 text-3xl font-normal cursor-pointer dark:text-gray-100', isOpen ? 'expanded' : 'expandable')}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                {title}
            </div>
            <motion.div
                animate={{height: isOpen ? 'auto' : 0}}
                transition={{duration: 0.3}}
                initial={false}
                className={twMerge([hiddenClassName])}
            >
                {hiddenContent}
            </motion.div>
        </motion.div>
    );
};

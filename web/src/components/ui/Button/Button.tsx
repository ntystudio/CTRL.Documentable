/* eslint-disable react/button-has-type */
/* eslint-disable no-unused-vars */
import React, {ButtonHTMLAttributes, FC, ReactElement, ReactNode} from 'react';
import {Spinner} from '../Spinner/Spinner';
import classNames from 'classnames';
import {twMerge} from 'tailwind-merge';

type Variant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'slime-green'
    | 'primo-light'
    | 'gray'
    | 'outlined'
    | 'black'
    | 'mint'
    | 'danger-outline';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AppButtonProps = {
    type?: 'submit' | 'reset' | 'button';
    variant: Variant;
    disabled?: boolean;
    children: ReactElement | ReactNode | string;
    size?: Size;
    isRtl?: boolean;
    extendClass?: string;
    isLoading?: boolean;
    isFull?: boolean;
    className?: string;
    isActive?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const PrimaryClasses = twMerge('inline-flex  items-center justify-center rounded-t-lg hover:text-gray-600 ');
const PrimoLightClasses = 'bg-white hover:bg-gray-200 text-gray-500 border border-gray-200';
const lightClasses = 'bg-white hover:bg-gray-200 text-gray-500 border border-gray-200';
const DangerClasses = 'bg-red-500 hover:bg-red-600 text-white';
const DefaultClasses = 'bg-white hover:bg-gray-200 text-gray-500 border border-gray-200';
const SecondaryClasses = 'bg-gray-700 hover:text-gray-700 hover:bg-white text-white border border-gray-200';
const InfoClasses = 'bg-blue-500 hover:bg-blue-600 text-white';
const SuccessClasses = 'bg-green-500 hover:bg-green-600 text-white';
const SlimeGreenClasses = 'bg-[#83B654] hover:bg-[#83B111] text-white';
const grayClasses = '  bg-gray-200  ';
const outlinedClasses = twMerge([
    'flex gap-4 rounded-md p-2.5 ',
    'items-center justify-center',
    'border border-neutral-gray-border',
    'hover:bg-neutral-gray-border ',
    'transition-colors delay-75 ',
    'bg-white',
]);
const dangerOutlineClasses = twMerge([
    'flex gap-4 rounded-md p-2.5 ',
    'items-center justify-center',
    'border border-red-400 text-red-400',
    'hover:bg-red-400 hover:text-white',
    'transition-colors delay-75 ',
    'bg-white',
]);

const selectVariant = (variant: Variant, isActive: boolean) => {
    switch (variant) {
        case 'primary':
            return isActive ? 'text-gray-700 ' : PrimaryClasses;
        case 'dark':
            return 'bg-gray-800 hover:bg-gray-700 text-white';
        case 'gray':
            return isActive ? 'text-slate-800 bg-gray-200 text-black font-bold' : grayClasses;
        case 'black':
            return isActive ? 'text-slate-800 bg-black text-white font-bold' : grayClasses;
        case 'primo-light':
            return isActive ? 'text-white font-bold' : PrimoLightClasses;
        case 'danger':
            return isActive ? 'bg-red-700 font-bold' : DangerClasses;
        case 'light':
            return isActive ? 'bg-gray-200 font-bold' : lightClasses;
        case 'secondary':
            return isActive ? 'bg-gray-600 font-bold' : SecondaryClasses;
        case 'info':
            return isActive ? 'bg-blue-700 font-bold' : InfoClasses;
        case 'success':
            return isActive ? 'bg-green-700 font-bold' : SuccessClasses;
        case 'slime-green':
            return isActive ? 'bg-[#83B111] font-bold' : SlimeGreenClasses;
        case 'outlined':
            return outlinedClasses;
        case 'danger-outline':
            return dangerOutlineClasses;
        case 'mint':
            return 'rounded-md mint-btn-gradient px-4 py-3 shadow text-center text-lg font-medium leading-tight tracking-tight text-white';
        default:
            return isActive ? 'bg-gray-300 font-bold' : DefaultClasses;
    }
};

const animation = () => {
    return 'transition-all';
};

const selectSize = (size: Size) => {
    switch (size) {
        case 'xs':
            return 'px-0.5 text-xs';
        case 'sm':
            return 'px-1 py-0.5 text-xs';
        case 'md':
            return 'px-3 py-1.5 text-xs';
        case 'lg':
            return 'px-4 py-2 text-lg';
        case 'xl':
            return 'px-6 py-2 text-lg';
        case '2xl':
            return 'px-8 py-4 text-lg';
        case '3xl':
            return 'px-10 py-6 text-lg';
        default:
            return 'px-12 py-8';
    }
};
export const Button: FC<AppButtonProps> = ({
                                               onClick,
                                               size = 'lg',
                                               variant = 'primary',
                                               type = 'button',
                                               children = '',
                                               extendClass = '',
                                               disabled = false,
                                               isLoading = false,
                                               isFull = false,
                                               isRtl = true,
                                               className = '',
                                               isActive = true,
                                               ...otherProps
                                           }) => {
    const classes = classNames(
        extendClass,
        'flex justify-center items-center',
        size && selectSize(size),
        isRtl ? 'flex-row-reverse' : 'flex-row',
        isLoading && 'cursor-not-allowed opacity-75',
        isFull && 'w-full',
        animation(),
        selectVariant(variant, isActive),
        className,
        {
            'cursor-not-allowed': disabled,
        },
    );

    return (
        <button
            onClick={onClick}
            type={type || 'button'}
            disabled={isLoading || disabled}
            className={classes}
            {...otherProps}
        >
            {isLoading ? <Spinner height={22} /> : <div>{children}</div>}
        </button>
    );
};

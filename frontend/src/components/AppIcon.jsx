import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    // Support for Material Symbols with 'ms:' prefix
    if (name?.startsWith('ms:')) {
        const iconName = name.split(':')[1];
        return (
            <span 
                className={`material-symbols-outlined ${className}`} 
                style={{ fontSize: size, color: color }}
                {...props}
            >
                {iconName}
            </span>
        );
    }

    const IconComponent = LucideIcons?.[name];

    if (!IconComponent) {
        return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
    }

    return <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
    />;
}
export default Icon;
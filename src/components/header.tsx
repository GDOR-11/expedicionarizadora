import * as React from "react";

export default function Header(args: {
    children: React.ReactNode,
    id: string,
    hidden?: boolean
}) {
    return (
        <div className="header"
            id={args.id}
            style={{ display: args.hidden ? "none" : "flex" }}
        >
            {args.children}
        </div>
    );
}

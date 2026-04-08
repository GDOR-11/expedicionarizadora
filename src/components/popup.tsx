import * as React from "react";

export default function Popup(args: {
    children: React.ReactNode,
    id: string
}) {
    return (
        <div className="popup-container"
            id={args.id}
            style={{ display: "none" }}
        >
            <div className="popup">
                {args.children}
            </div>
        </div>
    );
}

import * as OBC from "openbim-components";
import { FragmentsGroup } from "bim-fragment";

export class $$$NAME$$$ extends OBC.Component<string> implements OBC.UI {
    static readonly uuid = "$$$UUID$$$" as const;

    enabled = true;

    uiElement = new OBC.UIElement<{ Measure: OBC.Button; Camera: OBC.Button }>();

    group: FragmentsGroup;

    private _data = "Hello world";

    constructor(components: OBC.Components) {
        super(components);
        this.components.tools.add($$$NAME$$$.uuid, this);

        this.group = new FragmentsGroup();

        const Measure = new OBC.Button(components);
        Measure.onClick.add(() => {
            console.log(this.group);
            console.log("Measure active!");
        });

        Measure.tooltip = "Measure";

        const Camera = new OBC.Button(components);
        Camera.onClick.add(() => {
            console.log(this.group);
            console.log("Camera active!");
        });

        Camera.tooltip = "Camera";

        this.uiElement.set({ Measure, Camera });
    }

    get() {
        return this._data;
    }

    log() {
        console.log(this.group);
    }
}
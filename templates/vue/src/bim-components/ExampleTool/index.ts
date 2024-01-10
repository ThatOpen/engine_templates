import * as OBC from "openbim-components"

export interface ExampleToolConfig {
  message: string
  requiredSetting: number | null
}

export class ExampleTool extends OBC.Component<null> implements OBC.UI, OBC.Disposable, OBC.Configurable<ExampleToolConfig> {
  static uuid = "e425ff6a-eb8a-4866-a9c9-daee87d38d6d"
  enabled = false
  uiElement = new OBC.UIElement<{
    activationBtn: OBC.Button
  }>()

  constructor(components: OBC.Components) {
    super(components)
    components.tools.add(ExampleTool.uuid, this)
    if (components.uiEnabled) {
      this.setUI()
    }
  }

  private setUI() {
    const activationBtn = new OBC.Button(this.components)
    activationBtn.materialIcon = "send"
    activationBtn.tooltip = "Log Message"
    activationBtn.onClick.add(() => this.logMessage())
    this.uiElement.set({activationBtn})
  }

  readonly onSetup = new OBC.Event<ExampleTool>()

  config: Required<ExampleToolConfig> = {
    message: "I'm the default message config",
    requiredSetting: null
  }

  async setup(config?: Partial<ExampleToolConfig>) {
    this.config = { ...this.config, ...config }
    const { requiredSetting } = this.config
    if (requiredSetting === null) {
      throw new Error("You need to set 'Required Setting' in order for ExampleTool to work!")
    }
    this.enabled = true
    await this.onSetup.trigger()
  }

  readonly onDisposed = new OBC.Event<string>()

  async dispose() {
    // Set here all your dispose logic, like cleaning up variables, disposing geometry, etc.
    this.onSetup.reset()
    await this.onDisposed.trigger(ExampleTool.uuid)
    this.onDisposed.reset()
  }

  logMessage() {
    const { requiredSetting } = this.config
    if (!(this.enabled && requiredSetting !== null)) { return }
    console.log(this.config.message, `Your required setting was ${this.config.requiredSetting}`)
  }
  
  get() {
    return null
  }
}
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { Ingredient_Omnissiah, Quantity, Solver } from 'solver';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}



/*
EXAMPLES
https://github.com/zsviczian/obsidian-excalidraw-plugin/blob/master/src/main.ts#L2318
  private switchToExcalidarwAfterLoad() {
    const self = this;
    this.app.workspace.onLayoutReady(() => {
      let leaf: WorkspaceLeaf;
      for (leaf of app.workspace.getLeavesOfType("markdown")) {
        if (
          leaf.view instanceof MarkdownView &&
          self.isExcalidrawFile(leaf.view.file)
        ) {
          self.excalidrawFileModes[(leaf as any).id || leaf.view.file.path] =
            VIEW_TYPE_EXCALIDRAW;
          self.setExcalidrawView(leaf);
        }
      }
    });
  }

  public async setExcalidrawView(leaf: WorkspaceLeaf) {
    await leaf.setViewState({
      type: VIEW_TYPE_EXCALIDRAW,
      state: leaf.view.getState(),
      popstate: true,
    } as ViewState);
  }

  public isExcalidrawFile(f: TFile) {
    if(!f) return false;
    if (f.extension === "excalidraw") {
      return true;
    }
    const fileCache = f ? this.app.metadataCache.getFileCache(f) : null;
    return !!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEY];
  }

/////////////////////////////////
// START HERE
/////////////////////////////////

    this.addRibbonIcon(ICON_NAME, t("CREATE_NEW"), async (e) => {
        this.createAndOpenDrawing(
        getDrawingFilename(this.settings),
        linkClickModifierType(emulateCTRLClickForLinks(e)), // SMACK: Something like "new-tab";
        ); 
    });


  public async createAndOpenDrawing(
    filename: string,
    location: PaneTarget,
    foldername?: string,
    initData?: string,
  ): Promise<string> {
    const file = await this.createDrawing(filename, foldername, initData);
    this.openDrawing(file, location, true, undefined, true);
    return file.path;
  }

  public openDrawing(
    drawingFile: TFile,
    location: PaneTarget,
    active: boolean = false,
    subpath?: string,
    justCreated: boolean = false
  ) {
    if(location === "md-properties") {
      location = "new-tab";
    }
    let leaf: WorkspaceLeaf;
    if(location === "popout-window") {
      leaf = app.workspace.openPopoutLeaf();
    }
    if(location === "new-tab") {
      leaf = app.workspace.getLeaf('tab');
    }
    if(!leaf) {
      leaf = this.app.workspace.getLeaf(false);
      if ((leaf.view.getViewType() !== 'empty') && (location === "new-pane")) {
        leaf = getNewOrAdjacentLeaf(this, leaf)    
      }
    }

    leaf.openFile(
      drawingFile, 
      !subpath || subpath === "" 
        ? {active}
        : { active, eState: { subpath } }
    ).then(()=>{
      if(justCreated && this.ea.onFileCreateHook) {
        try {
          this.ea.onFileCreateHook({
            ea: this.ea,
            excalidrawFile: drawingFile,
            view: leaf.view as ExcalidrawView,
          });
        } catch(e) {
          console.error(e);
        }
      }
    })
  }



*/

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    private view: ExampleView;

    async onload() {
        await this.loadSettings();

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
            // Called when the user clicks the icon.
            new Notice('!');
        });

        this.registerView(
            VIEW_TYPE_EXAMPLE,
            (leaf: WorkspaceLeaf) => (this.view = new ExampleView(leaf))
        );
    
        this.addRibbonIcon("dice", "Activate view", (e) => {
            console.log( "FUCK", e );
            this.activateView();
        });

        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-sample-modal-simple',
            name: 'Open sample modal (simple)',
            callback: () => {
                new SampleModal(this.app).open();
            }
        });
        // This adds an editor command that can perform some operation on the current editor instance
        this.addCommand({
            id: 'sample-editor-command',
            name: 'Sample editor command',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                console.log(editor.getSelection());
                editor.replaceSelection('Sample Editor Command');
            }
        });

        // This adds a complex command that can check whether the current state of the app allows execution of the command
        this.addCommand({
            id: 'open-sample-modal-complex',
            name: 'Open sample modal (complex)',
            checkCallback: (checking: boolean) => {
                // Conditions to check
                const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (markdownView) {
                    // If checking is true, we're simply "checking" if the command can be run.
                    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        new SampleModal(this.app).open();
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true;
                }
            }
        });



        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));

        // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
        // Using this function will automatically remove the event listener when this plugin is disabled.
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            console.log('click', evt);
        });

        // When registering intervals, this function will automatically clear the interval when the plugin is disabled.
        this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
    }

    async onunload() {
    }
  
    async activateView() {
        let leaf: WorkspaceLeaf;
        leaf = this.app.workspace.getLeaf('tab');

        // this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);


        // await this.app.workspace.getRightLeaf(false).setViewState({
        // type: VIEW_TYPE_EXAMPLE,
        // active: true,
        // });

        await leaf.setViewState({
            type: VIEW_TYPE_EXAMPLE,
            active: true,
        });

        // this.app.workspace.revealLeaf(
        //     this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
        // );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.setText('Woah!');
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
    }
}

import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
    private solver: Solver;
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "New fucking tab!";
  }

  async onOpen() {
    // this.containerEl.setText( "<h1>test</h1>" );
    const container = this.containerEl.children[1];
    container.setText( "<h1>asdf</h1>" );
    // const iframe = container.createEl("iframe");
    // iframe.title = "Fugg iFrame";

    // iframe.setAttr( "title", "Iframe Example" );
    // // iframe.setAttr( "src", "https://www.google.com" );
    // iframe.setAttr( "src", "solver.html" );
    // iframe.setAttr( "height", "100%" );
    // iframe.setAttr( "width", "100%" );

    const div = this.containerEl.createDiv();
    div.setText( "<h1>hehllo</h1>" )
    div.setText( "fuck" );

    let I_O: Ingredient_Omnissiah = new Ingredient_Omnissiah();


    I_O.addIngredient( "Chicken",                   Quantity.fromStr("110g"), 220, 30 );
    I_O.addIngredient( "Chobani FF Vanilla",        Quantity.fromStr("10 g"), 110, 12 )
    I_O.addIngredient( "1 Scoop Shake w/ Collagen", Quantity.fromStr("1 scoop"), 165, 35 )
    I_O.addIngredient( "Bacon, 2 medium slices",    Quantity.fromStr("10 g"), 86, 6 )
    I_O.addIngredient( "Egg",                       Quantity.fromStr("10  g"), 70, 6 )
    I_O.addIngredient( "1 cup Grated Cheddar",      Quantity.fromStr("10g"), 480, 24 )
    I_O.addIngredient( "1 cup heavy cream",         Quantity.fromStr("10g"), 821, 4.9 )

    console.log( I_O );
    console.log( I_O.getIngredient( "Egg" ) );

    this.solver = new Solver( container, I_O );

    // container.empty();
    // container.createEl("h4", { text: "Well I'll be a son of a bitch" });
  }

  async onClose() {
    // Nothing to clean up.
  }
}
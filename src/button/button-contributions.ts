
/**
 * This file needs to be clear from imports, because it is copied into the test project and used by mocha.
 * Happy about anyone who's able to make this work with imports (i.e. run the tests in this project), but I couldn't figure it out and gave up.
 */

export type SupportedApplication = "github" | "gitlab" | "bitbucket-server" | "bitbucket";

export interface ButtonContributionParams {
  /**
   * A unique id for the button contribution. Used to identify the button in the UI.
   */
  id: string,

  /**
   * 
   */
  exampleUrls: string[],

  /**
   * A CSS selector that matches the parent element in which the button should be inserted.
   * 
   * Use the developer tools -> right click on the element -> "copy JS path" to get the selector.
   */
  selector: string,

  /**
   * The element in which the button should be inserted.
   * 
   * This element will be inserted into teh main document and allows for styling within the original page.
   * 
   * The structure looks like this:
   * 
   * <selector>
   *     <some other elements/> ....
   *    <containerElement>
   *       <plasmo-csui>
   *         #shadow-root
   *       </plasmo-csui>
   *    </containerElement>
   * </selector>
   */
  containerElement: {
    type: "div" | "li",
    props: {
      [key: string]: string
    }
  },

  /**
   * A regular expression that is used to match the current URL. This is making the selection faster and also can help to disambiguate.
   */
  match?: RegExp,

  /** 
   * A function that is called to determine if the button insertion should be stopped.
  */
  earlyExit?: () => boolean,

  /**
   * The application that is supported by this button contribution.
   */
  application: SupportedApplication,

  /**
   * Additional class names that should be added to the elements.
   */
  additionalClassNames?: ("secondary"|"medium"|"left-align-menu")[],

  /**
   * A selector that is used to insert the button before a specific element.
   */
  insertBefore?: string,

  /**
   * A list of manipulations that should be applied to the document.
   * 
   * Each manipulation contains a CSS selector (element) that is used to find the element to manipulate and optionally
   * the classnames to remove and add.
   */
  manipulations?: { element: string, remove?: string, add?: string, style?: Partial<CSSStyleDeclaration> }[]
}

function createElement(type: "div" | "li",
props: {
  [key: string]: string
}) {
  return {
    type,
    props
  };
}

export const buttonContributions: ButtonContributionParams[] = [
    // GitLab
    {
      id: "gl-repo", // also taking care of branches
      exampleUrls: [
        "https://gitlab.com/svenefftinge/browser-extension-test",
        "https://gitlab.com/svenefftinge/browser-extension-test/-/tree/my-branch",
      ],
      // must not match /blob/ because that is a file
      match:  /^(?!.*\/blob\/).*$/,
      selector: "#tree-holder > div.nav-block.gl-display-flex.gl-xs-flex-direction-column.gl-align-items-stretch > div.tree-controls > div.d-block.d-sm-flex.flex-wrap.align-items-start.gl-children-ml-sm-3.gl-first-child-ml-sm-0",
      containerElement: {type: "div", props: {marginLeft: "8px"}},
      application: "gitlab",
      manipulations: [
        {
          // make the clone button secondary 
          element: "#clone-dropdown",
          remove: "btn-confirm",
        }
      ],
    },
    {
      id: "gl-file",
      exampleUrls: [
        //TODO fix me "https://gitlab.com/svenefftinge/browser-extension-test/-/blob/my-branch/README.md",
      ],
      match: /\/blob\//,
      selector: "#fileHolder > div.js-file-title.file-title-flex-parent > div.gl-display-flex.gl-flex-wrap.file-actions",
      containerElement: createElement("div", {display: "inline-flex", marginLeft: "8px"}),
      application: "gitlab",
      manipulations: [
        {
          // make the clone button secondary 
          element: "#fileHolder > div.js-file-title.file-title-flex-parent > div.gl-display-flex.gl-flex-wrap.file-actions > div.gl-sm-ml-3.gl-mr-3 > div > button",
          remove: "btn-confirm",
        }
      ],
    },
    {
      id: "gl-merge-request",
      exampleUrls: [
        "https://gitlab.com/svenefftinge/browser-extension-test/-/merge_requests/1",
      ],
      match: /\/merge_requests\//,
      selector: "#content-body > div.merge-request > div.detail-page-header.border-bottom-0.gl-display-block.gl-pt-5.gl-md-display-flex\\!.is-merge-request > div.detail-page-header-actions.gl-align-self-start.is-merge-request.js-issuable-actions.gl-display-flex",
      containerElement: createElement("div", {marginLeft: "8px"}),
      application: "gitlab",
      insertBefore: "#content-body > div.merge-request > div.detail-page-header.border-bottom-0.gl-display-block.gl-pt-5.gl-md-display-flex\\!.is-merge-request > div.detail-page-header-actions.gl-align-self-start.is-merge-request.js-issuable-actions.gl-display-flex > div.gl-display-flex.gl-justify-content-end.gl-w-full.gl-relative",
      manipulations: [
        {
          // make the clone button secondary 
          element: "#content-body > div.merge-request > div.detail-page-header.border-bottom-0.gl-display-block.gl-pt-5.gl-md-display-flex\\!.is-merge-request > div.detail-page-header-actions.gl-align-self-start.is-merge-request.js-issuable-actions.gl-display-flex > div.gl-md-ml-3.dropdown.gl-dropdown.gl-display-none\\!.gl-md-display-flex\\! > button",
          remove: "btn-confirm",
        }
      ],
    },
    {
      id: "gl-issue",
      exampleUrls: [
        "https://gitlab.com/svenefftinge/browser-extension-test/-/issues/1",
      ],
      match: /\/issues\//,
      selector: "#content-body > div.issue-details.issuable-details.js-issue-details > div.detail-page-description.content-block.js-detail-page-description.gl-pt-3.gl-pb-0.gl-border-none > div:nth-child(1) > div > div.gl-display-flex.gl-align-items-flex-start.gl-flex-direction-column.gl-sm-flex-direction-row.gl-gap-3.gl-pt-3 > div",
      containerElement: createElement("div", {marginLeft: "0", marginRight: "0px"}),
      application: "gitlab",
      insertBefore: "#new-actions-header-dropdown",
      manipulations: [
        {
          element: "#content-body > div.issue-details.issuable-details.js-issue-details > div.detail-page-description.content-block.js-detail-page-description.gl-pt-3.gl-pb-0.gl-border-none > div.js-issue-widgets > div > div > div.new-branch-col.gl-font-size-0.gl-my-2 > div > div.btn-group.available > button.gl-button.btn.btn-md.btn-confirm.js-create-merge-request",
          remove: "btn-confirm",
        },
        {
          element: "#content-body > div.issue-details.issuable-details.js-issue-details > div.detail-page-description.content-block.js-detail-page-description.gl-pt-3.gl-pb-0.gl-border-none > div.js-issue-widgets > div > div > div.new-branch-col.gl-font-size-0.gl-my-2 > div > div.btn-group.available > button.gl-button.btn.btn-icon.btn-md.btn-confirm.js-dropdown-toggle.dropdown-toggle.create-merge-request-dropdown-toggle",
          remove: "btn-confirm",
        },
      ],
    },
  
    // GitHub
    {
      id: "new-repo",
      match: /^https?:\/\/([^/]+)\/([^/]+)\/([^/]+)(\/(tree\/.*)?)?$/,
      exampleUrls: [
        // disabled testing, because the new layout doesn't show as an anonymous user
        // "https://github.com/svenefftinge/browser-extension-test",
        // "https://github.com/svenefftinge/browser-extension-test/tree/my-branch",
      ],
      selector: "#repository-details-container > ul",
      containerElement: createElement("li", {
      }),
      application: "github",
      manipulations: [
        {
          // make the code button secondary 
          element: "#repository-details-container > ul > li > get-repo > details > summary",
          remove: "Button--primary",
          add: "Button--secondary"
        }
      ],
      earlyExit: () => {
        return document.querySelector("div.file-navigation") !== null;
      }
    },
    {
      id: "commit",
      exampleUrls: [
        "https://github.com/svenefftinge/browser-extension-test/commit/82d701a9ac26ea25da9b24c5b3722b7a89e43b16"
      ],
      selector: "#repo-content-pjax-container > div > div.commit.full-commit.mt-0.px-2.pt-2",
      insertBefore: "#browse-at-time-link",
      containerElement: createElement("div", {
        float: "right",
        marginLeft: "8px",
      }),
      application: "github",
      additionalClassNames: ["medium"],
    },
    
    {
      id: "issues",
      exampleUrls: [
        "https://github.com/svenefftinge/browser-extension-test/issues/1"
      ],
      selector: "#partial-discussion-header > div.gh-header-show > div > div",
      containerElement: createElement("div",{
        order: "2"
      }),
      match: /\/issues\//,
      application: "github",
      manipulations: [
        {
          // make the code button secondary 
          element: "#partial-discussion-header > div.gh-header-show > div > div > a",
          remove: "Button--primary",
          add: "Button--secondary"
        }
      ],
    },
    {
      id: "pulls",
      exampleUrls: [
        "https://github.com/svenefftinge/browser-extension-test/pull/2",
      ],
      selector: "#partial-discussion-header > div.gh-header-show > div > div",
      containerElement: createElement("div",{
        order: "2"
      }),
      match: /\/pull\//,
      application: "github",
    },
    {
      id: "repo",
      exampleUrls: [
        "https://github.com/svenefftinge/browser-extension-test",
        "https://github.com/svenefftinge/browser-extension-test/tree/my-branch",
      ],
      selector: "#repo-content-turbo-frame > div > div > div.Layout.Layout--flowRow-until-md.Layout--sidebarPosition-end.Layout--sidebarPosition-flowRow-end > div.Layout-main > div.file-navigation.mb-3.d-flex.flex-items-start,#repo-content-pjax-container > div > div > div.Layout.Layout--flowRow-until-md.Layout--sidebarPosition-end.Layout--sidebarPosition-flowRow-end > div.Layout-main > div.file-navigation.mb-3.d-flex.flex-items-start",
      containerElement: createElement("div", {
        marginLeft: "8px",
      }),
      application: "github",
      additionalClassNames: ["medium"],
      manipulations: [
        {
          // make the code button secondary 
          element: "#repo-content-pjax-container > div > div > div.Layout.Layout--flowRow-until-md.Layout--sidebarPosition-end.Layout--sidebarPosition-flowRow-end > div.Layout-main > div.file-navigation.mb-3.d-flex.flex-items-start > span.d-none.d-md-flex.ml-2 > get-repo > details > summary",
          remove: "Button--primary",
          add: "Button--secondary"
        }
      ],
    },
    {
      id: "file",
      exampleUrls: [
        "https://github.com/svenefftinge/browser-extension-test/blob/my-branch/README.md"
      ],
      selector: "#StickyHeader > div > div > div.Box-sc-g0xbh4-0.gtBUEp",
      containerElement: createElement("div", {
        marginLeft: "8px",
      }),
      application: "github",
      additionalClassNames: ["medium"],
    },
    {
      id: "empty-repo",
      exampleUrls: [
        //TODO fixme "https://github.com/svenefftinge/empty-repo",
      ],
      selector: "#repo-content-pjax-container > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div,#repo-content-turbo-frame > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div",
      containerElement: createElement("div", {}),
      application: "github",
      manipulations: [
        {
          element: "#repo-content-pjax-container > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div > a, #repo-content-turbo-frame > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div > a",
          style: {
            display: "none",
          }
        },
        {
          element: "#repo-content-pjax-container > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div > h3, #repo-content-turbo-frame > div > div.d-md-flex.flex-items-stretch.gutter-md.mb-4 > div.col-md-6.mb-4.mb-md-0 > div > h3",
          style: {
            display: "none",
          }
        }
      ]
      
    },
    // BitBucket Server
    {
      id: "bbs-repo",
      match: /\/browse/,
      exampleUrls: [
        "https://bitbucket.gitpod-dev.com/users/svenefftinge/repos/browser-extension-test/browse",
        "https://bitbucket.gitpod-dev.com/users/svenefftinge/repos/browser-extension-test/browse?at=refs%2Fheads%2Fmy-branch",
      ],
      selector: "#main > div.aui-toolbar2.branch-selector-toolbar > div > div.aui-toolbar2-primary > div > div:nth-child(1) > div",
      insertBefore: "#branch-actions",
      containerElement: createElement("div", {
        marginLeft: "2px",
      }),
      application: "bitbucket-server",
      additionalClassNames: ["secondary"],
    
    },
    {
      id: "bbs-pull-request",
      exampleUrls: [
        // disabled becaus it doesn't work anonymously
        // "https://bitbucket.gitpod-dev.com/users/svenefftinge/repos/browser-extension-test/pull-requests/1/overview",
      ],
      selector: "#pull-requests-container > header > div.pull-request-header-bar > div.pull-request-actions",
      insertBefore: "#pull-requests-container > header > div.pull-request-header-bar > div.pull-request-actions > div.pull-request-more-actions",
      containerElement: createElement("div", {
        marginLeft: "2px",
      }),
      application: "bitbucket-server",
    },
    
    // bitbucket.org
    // we use xpath epressions, because the CSS selectors are not stable enough
    // tests are disabled because the URLs are not rechable without a session
    {
      id: "bb-repo",
      exampleUrls: [
        // "https://bitbucket.org/svenefftinge/browser-extension-test/src/master/"
      ],
      selector: 'xpath://*[@id="root"]/div[2]/div[3]/div/div/div[1]/div/header/div/div/div/div[2]/div',
      insertBefore: "#root > div.css-kyhvoj > div.css-e48442 > div > div > div.css-8ypwyz.efo6slf1 > div > header > div > div > div > div.sc-kAzzGY.hKOvhL > div > div:nth-child(3)",
      containerElement: createElement("div", {
        marginLeft: "2px",
      }),
      application: "bitbucket",
    },
    {
      id: "bb-pull-request",
      exampleUrls: [
        // "https://bitbucket.org/efftinge/browser-extension-test/pull-requests/1"
      ],
      selector: 'xpath://*[@id="pull-request-details"]/header/div/div/div[2]/div/div[2]/div/div/div',
      containerElement: createElement("div", {
        marginLeft: "2px",
      }),
      application: "bitbucket",
    },
    {
      id: "bb-branch",
      match: /\/branch\/(.+)/,
      exampleUrls: [
        // "https://bitbucket.org/efftinge/browser-extension-test/branch/my-branch"
      ],
      selector: 'xpath://*[@id="root"]/div[2]/div[3]/div/div/div[1]/div/div/div[2]/div/div',
      containerElement: createElement("div", {
        marginLeft: "2px",
      }),
      application: "bitbucket",
    }
  ];
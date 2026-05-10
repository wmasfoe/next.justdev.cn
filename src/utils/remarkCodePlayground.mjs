import { inferPlaygroundFile, parseCodeFenceMeta } from "./codeFenceMeta.mjs";

const COMPONENT_NAME = "CodePlayground";
const COMPONENT_IMPORT_SOURCE = "@/components/mdx/CodePlayground.astro";
const COMPONENT_IMPORT = `import ${COMPONENT_NAME} from "${COMPONENT_IMPORT_SOURCE}";`;

export function remarkCodePlayground() {
  return (tree) => {
    let transformed = false;

    function transformChildren(parent) {
      if (!Array.isArray(parent.children)) return;

      const nextChildren = [];
      let index = 0;

      while (index < parent.children.length) {
        const node = parent.children[index];
        const parsed = parseInteractiveCodeNode(node);

        if (!parsed) {
          transformChildren(node);
          nextChildren.push(node);
          index += 1;
          continue;
        }

        const group = [parsed];
        let cursor = index + 1;

        if (parsed.meta.playgroup) {
          while (cursor < parent.children.length) {
            const candidate = parseInteractiveCodeNode(parent.children[cursor]);
            if (
              !candidate ||
              candidate.meta.mode !== parsed.meta.mode ||
              candidate.meta.playgroup !== parsed.meta.playgroup
            ) {
              break;
            }

            group.push(candidate);
            cursor += 1;
          }
        }

        nextChildren.push(createPlaygroundNode(group));
        transformed = true;
        index = cursor;
      }

      parent.children = nextChildren;
    }

    transformChildren(tree);

    if (transformed) {
      injectComponentImport(tree);
    }
  };
}

function parseInteractiveCodeNode(node) {
  if (!node || node.type !== "code") return null;

  const meta = parseCodeFenceMeta(node.lang, node.meta ?? "");
  if (!meta.interactive) return null;

  return { node, meta };
}

function createPlaygroundNode(group) {
  const first = group[0];
  const { mode, template, layout, hideResult } = first.meta;

  if (group.length > 1) {
    for (const item of group) {
      if (!item.meta.file) {
        throw new Error(
          `Multi-file ${mode} group \`${first.meta.playgroup}\` requires every code fence to set file=...`,
        );
      }
    }
  }

  for (const item of group.slice(1)) {
    if (item.meta.hasTemplate) {
      throw new Error(
        `Only the first code fence in playgroup \`${first.meta.playgroup}\` may set template=...`,
      );
    }
    if (item.meta.hasLayout) {
      throw new Error(
        `Only the first code fence in playgroup \`${first.meta.playgroup}\` may set the layout (row/col).`,
      );
    }
    if (item.meta.hasHideResult) {
      throw new Error(
        `Only the first code fence in playgroup \`${first.meta.playgroup}\` may set the hideResult flag.`,
      );
    }
  }

  const files = {};
  const visibleFiles = [];

  for (const item of group) {
    const path = inferPlaygroundFile({
      file: item.meta.file,
      lang: item.meta.lang,
      mode,
      template,
    });

    if (files[path]) {
      throw new Error(`Duplicate playground file path \`${path}\`.`);
    }

    files[path] = item.node.value ?? "";
    visibleFiles.push(path);
  }

  const activeFile = visibleFiles[0];
  const title = first.meta.playgroup ?? (mode === "preview" ? "Preview" : "Playground");

  const attributes = [
    stringAttribute("mode", mode),
    stringAttribute("template", template),
    stringAttribute("layout", layout),
    stringAttribute("files", JSON.stringify(files)),
    stringAttribute("visibleFiles", JSON.stringify(visibleFiles)),
    stringAttribute("activeFile", activeFile),
    stringAttribute("title", title),
  ];

  if (hideResult) {
    attributes.push(stringAttribute("hideResult", "true"));
  }

  return {
    type: "mdxJsxFlowElement",
    name: COMPONENT_NAME,
    attributes,
    children: [],
  };
}

function injectComponentImport(tree) {
  const alreadyImported = tree.children?.some(
    (node) =>
      node.type === "mdxjsEsm" &&
      typeof node.value === "string" &&
      node.value.includes(COMPONENT_IMPORT),
  );

  if (alreadyImported) return;

  tree.children.unshift({
    type: "mdxjsEsm",
    value: COMPONENT_IMPORT,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportDefaultSpecifier",
                local: {
                  type: "Identifier",
                  name: COMPONENT_NAME,
                },
              },
            ],
            source: {
              type: "Literal",
              value: COMPONENT_IMPORT_SOURCE,
              raw: JSON.stringify(COMPONENT_IMPORT_SOURCE),
            },
          },
        ],
      },
    },
  });
}

function stringAttribute(name, value) {
  return {
    type: "mdxJsxAttribute",
    name,
    value,
  };
}

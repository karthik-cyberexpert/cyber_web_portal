// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path2 from "path";

// src/visual-edits/component-tagger-plugin.js
import { parse } from "file:///home/project/node_modules/@babel/parser/lib/index.js";
import MagicString from "file:///home/project/node_modules/magic-string/dist/magic-string.es.mjs";
import { walk } from "file:///home/project/node_modules/estree-walker/dist/esm/estree-walker.js";
import path from "path";
var threeFiberElems = [
  "object3D",
  "audioListener",
  "positionalAudio",
  "mesh",
  "batchedMesh",
  "instancedMesh",
  "scene",
  "sprite",
  "lOD",
  "skinnedMesh",
  "skeleton",
  "bone",
  "lineSegments",
  "lineLoop",
  "points",
  "group",
  "camera",
  "perspectiveCamera",
  "orthographicCamera",
  "cubeCamera",
  "arrayCamera",
  "instancedBufferGeometry",
  "bufferGeometry",
  "boxBufferGeometry",
  "circleBufferGeometry",
  "coneBufferGeometry",
  "cylinderBufferGeometry",
  "dodecahedronBufferGeometry",
  "extrudeBufferGeometry",
  "icosahedronBufferGeometry",
  "latheBufferGeometry",
  "octahedronBufferGeometry",
  "planeBufferGeometry",
  "polyhedronBufferGeometry",
  "ringBufferGeometry",
  "shapeBufferGeometry",
  "sphereBufferGeometry",
  "tetrahedronBufferGeometry",
  "torusBufferGeometry",
  "torusKnotBufferGeometry",
  "tubeBufferGeometry",
  "wireframeGeometry",
  "tetrahedronGeometry",
  "octahedronGeometry",
  "icosahedronGeometry",
  "dodecahedronGeometry",
  "polyhedronGeometry",
  "tubeGeometry",
  "torusKnotGeometry",
  "torusGeometry",
  "sphereGeometry",
  "ringGeometry",
  "planeGeometry",
  "latheGeometry",
  "shapeGeometry",
  "extrudeGeometry",
  "edgesGeometry",
  "coneGeometry",
  "cylinderGeometry",
  "circleGeometry",
  "boxGeometry",
  "capsuleGeometry",
  "material",
  "shadowMaterial",
  "spriteMaterial",
  "rawShaderMaterial",
  "shaderMaterial",
  "pointsMaterial",
  "meshPhysicalMaterial",
  "meshStandardMaterial",
  "meshPhongMaterial",
  "meshToonMaterial",
  "meshNormalMaterial",
  "meshLambertMaterial",
  "meshDepthMaterial",
  "meshDistanceMaterial",
  "meshBasicMaterial",
  "meshMatcapMaterial",
  "lineDashedMaterial",
  "lineBasicMaterial",
  "primitive",
  "light",
  "spotLightShadow",
  "spotLight",
  "pointLight",
  "rectAreaLight",
  "hemisphereLight",
  "directionalLightShadow",
  "directionalLight",
  "ambientLight",
  "lightShadow",
  "ambientLightProbe",
  "hemisphereLightProbe",
  "lightProbe",
  "spotLightHelper",
  "skeletonHelper",
  "pointLightHelper",
  "hemisphereLightHelper",
  "gridHelper",
  "polarGridHelper",
  "directionalLightHelper",
  "cameraHelper",
  "boxHelper",
  "box3Helper",
  "planeHelper",
  "arrowHelper",
  "axesHelper",
  "texture",
  "videoTexture",
  "dataTexture",
  "dataTexture3D",
  "compressedTexture",
  "cubeTexture",
  "canvasTexture",
  "depthTexture",
  "raycaster",
  "vector2",
  "vector3",
  "vector4",
  "euler",
  "matrix3",
  "matrix4",
  "quaternion",
  "bufferAttribute",
  "float16BufferAttribute",
  "float32BufferAttribute",
  "float64BufferAttribute",
  "int8BufferAttribute",
  "int16BufferAttribute",
  "int32BufferAttribute",
  "uint8BufferAttribute",
  "uint16BufferAttribute",
  "uint32BufferAttribute",
  "instancedBufferAttribute",
  "color",
  "fog",
  "fogExp2",
  "shape",
  "colorShiftMaterial"
];
var dreiElems = [
  "AsciiRenderer",
  "Billboard",
  "Clone",
  "ComputedAttribute",
  "Decal",
  "Edges",
  "Effects",
  "GradientTexture",
  "MarchingCubes",
  "Outlines",
  "PositionalAudio",
  "Sampler",
  "ScreenSizer",
  "ScreenSpace",
  "Splat",
  "Svg",
  "Text",
  "Text3D",
  "Trail",
  "CubeCamera",
  "OrthographicCamera",
  "PerspectiveCamera",
  "CameraControls",
  "FaceControls",
  "KeyboardControls",
  "MotionPathControls",
  "PresentationControls",
  "ScrollControls",
  "DragControls",
  "GizmoHelper",
  "Grid",
  "Helper",
  "PivotControls",
  "TransformControls",
  "CubeTexture",
  "Fbx",
  "Gltf",
  "Ktx2",
  "Loader",
  "Progress",
  "ScreenVideoTexture",
  "Texture",
  "TrailTexture",
  "VideoTexture",
  "WebcamVideoTexture",
  "CycleRaycast",
  "DetectGPU",
  "Example",
  "FaceLandmarker",
  "Fbo",
  "Html",
  "Select",
  "SpriteAnimator",
  "StatsGl",
  "Stats",
  "Trail",
  "Wireframe",
  "CurveModifier",
  "AdaptiveDpr",
  "AdaptiveEvents",
  "BakeShadows",
  "Bvh",
  "Detailed",
  "Instances",
  "Merged",
  "meshBounds",
  "PerformanceMonitor",
  "Points",
  "Preload",
  "Segments",
  "Fisheye",
  "Hud",
  "Mask",
  "MeshPortalMaterial",
  "RenderCubeTexture",
  "RenderTexture",
  "View",
  "MeshDiscardMaterial",
  "MeshDistortMaterial",
  "MeshReflectorMaterial",
  "MeshRefractionMaterial",
  "MeshTransmissionMaterial",
  "MeshWobbleMaterial",
  "PointMaterial",
  "shaderMaterial",
  "SoftShadows",
  "CatmullRomLine",
  "CubicBezierLine",
  "Facemesh",
  "Line",
  "Mesh",
  "QuadraticBezierLine",
  "RoundedBox",
  "ScreenQuad",
  "AccumulativeShadows",
  "Backdrop",
  "BBAnchor",
  "Bounds",
  "CameraShake",
  "Caustics",
  "Center",
  "Cloud",
  "ContactShadows",
  "Environment",
  "Float",
  "Lightformer",
  "MatcapTexture",
  "NormalTexture",
  "RandomizedLight",
  "Resize",
  "ShadowAlpha",
  "Shadow",
  "Sky",
  "Sparkles",
  "SpotLightShadow",
  "SpotLight",
  "Stage",
  "Stars",
  "OrbitControls"
];
var shouldTag = (name) => !threeFiberElems.includes(name) && !dreiElems.includes(name);
var isNextImageAlias = (aliases, name) => aliases.has(name);
var extractLiteralValue = (node) => {
  if (!node) return void 0;
  switch (node.type) {
    case "StringLiteral":
      return node.value;
    case "NumericLiteral":
      return node.value;
    case "BooleanLiteral":
      return node.value;
    case "ObjectExpression":
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === "ObjectProperty" && !prop.computed) {
          const key = prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
          obj[key] = extractLiteralValue(prop.value);
        }
      }
      return obj;
    case "ArrayExpression":
      return node.elements.map((el) => extractLiteralValue(el));
    default:
      return void 0;
  }
};
var findVariableDeclarations = (ast) => {
  const variables = /* @__PURE__ */ new Map();
  walk(ast, {
    enter(node) {
      if (node.type === "VariableDeclaration") {
        for (const declarator of node.declarations) {
          if (declarator.id.type === "Identifier" && declarator.init) {
            const varName = declarator.id.name;
            const value = extractLiteralValue(declarator.init);
            variables.set(varName, {
              name: varName,
              type: Array.isArray(value) ? "array" : typeof value === "object" ? "object" : "primitive",
              value,
              arrayItems: Array.isArray(value) ? value : void 0,
              loc: declarator.loc?.start
            });
          }
        }
      }
    }
  });
  return variables;
};
var findMapContext = (node, variables) => {
  let current = node;
  let depth = 0;
  const maxDepth = 10;
  while (current && depth < maxDepth) {
    if (current.type === "CallExpression" && current.callee?.type === "MemberExpression" && current.callee?.property?.name === "map") {
      const arrayName = current.callee.object?.name;
      const mapCallback = current.arguments?.[0];
      if (arrayName && mapCallback?.type === "ArrowFunctionExpression") {
        const itemParam = mapCallback.params?.[0];
        const indexParam = mapCallback.params?.[1];
        if (itemParam?.type === "Identifier") {
          const varInfo = variables.get(arrayName);
          return {
            arrayName,
            itemVarName: itemParam.name,
            arrayItems: varInfo?.arrayItems,
            arrayLoc: varInfo?.loc,
            indexVarName: indexParam?.type === "Identifier" ? indexParam.name : void 0
          };
        }
      }
    }
    current = current.parent;
    depth++;
  }
  return null;
};
var getSemanticName = (node, mapContext, imageAliases) => {
  const getName = () => {
    if (node.name.type === "JSXIdentifier") return node.name.name;
    if (node.name.type === "JSXMemberExpression")
      return `${node.name.object.name}.${node.name.property.name}`;
    return null;
  };
  const tagName = getName();
  if (!tagName) return null;
  if (isNextImageAlias(imageAliases, tagName)) {
    return "img";
  }
  return tagName;
};
function transformSource(src, filename) {
  if (/node_modules/.test(filename)) {
    return { code: src };
  }
  try {
    const ast = parse(src, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });
    const ms = new MagicString(src);
    const rel = path.relative(process.cwd(), filename);
    let mutated = false;
    walk(ast, {
      enter(node, parent) {
        if (parent && !Object.prototype.hasOwnProperty.call(node, "parent")) {
          Object.defineProperty(node, "parent", { value: parent, enumerable: false });
        }
      }
    });
    const variables = findVariableDeclarations(ast);
    const imageAliases = /* @__PURE__ */ new Set();
    walk(ast, {
      enter(node) {
        if (node.type === "ImportDeclaration" && node.source.value === "next/image") {
          for (const spec of node.specifiers) {
            imageAliases.add(spec.local.name);
          }
        }
      }
    });
    walk(ast, {
      enter(node) {
        if (node.type !== "JSXOpeningElement") return;
        const mapContext = findMapContext(node, variables);
        const semanticName = getSemanticName(node, mapContext, imageAliases);
        if (!semanticName || ["Fragment", "React.Fragment"].includes(semanticName) || !isNextImageAlias(imageAliases, semanticName.split("-")[0]) && !shouldTag(semanticName)) return;
        const { line, column } = node.loc.start;
        let orchidsId = `${rel}:${line}:${column}`;
        if (mapContext) {
          orchidsId += `@${mapContext.arrayName}`;
        }
        node.attributes?.forEach((attr) => {
          if (attr.type === "JSXAttribute" && attr.value?.type === "JSXExpressionContainer" && attr.value.expression?.type === "Identifier") {
            const refName = attr.value.expression.name;
            const varInfo = variables.get(refName);
            if (varInfo) {
              orchidsId += `@${refName}`;
            }
          }
        });
        if (mapContext?.indexVarName) {
          ms.appendLeft(node.name.end, ` data-map-index={${mapContext.indexVarName}}`);
        }
        ms.appendLeft(node.name.end, ` data-orchids-id="${orchidsId}" data-orchids-name="${semanticName}"`);
        mutated = true;
      }
    });
    if (mutated) {
      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true })
      };
    }
    return { code: src };
  } catch (err) {
    console.error("[componentTagger] Parse error:", err);
    return { code: src };
  }
}
function componentTaggerPlugin() {
  return {
    name: "component-tagger",
    enforce: "pre",
    transform(src, id) {
      if (id.endsWith(".jsx") || id.endsWith(".tsx")) {
        return transformSource(src, id);
      }
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "/home/project";
var logErrorsPlugin = () => ({
  name: "log-errors-plugin",
  // Inject a small client-side script that mirrors Vite overlay errors to console
  transformIndexHtml() {
    return {
      tags: [
        {
          tag: "script",
          injectTo: "head",
          children: `(() => {
            try {
              const logOverlay = () => {
                const el = document.querySelector('vite-error-overlay');
                if (!el) return;
                const root = (el.shadowRoot || el);
                let text = '';
                try { text = root.textContent || ''; } catch (_) {}
                if (text && text.trim()) {
                  const msg = text.trim();
                  // Use console.error to surface clearly in DevTools
                  console.error('[Vite Overlay]', msg);
                  // Also mirror to parent iframe with structured payload
                  try {
                    if (window.parent && window.parent !== window) {
                      window.parent.postMessage({
                        type: 'ERROR_CAPTURED',
                        error: {
                          message: msg,
                          stack: undefined,
                          filename: undefined,
                          lineno: undefined,
                          colno: undefined,
                          source: 'vite.overlay',
                        },
                        timestamp: Date.now(),
                      }, '*');
                    }
                  } catch (_) {}
                }
              };

              const obs = new MutationObserver(() => logOverlay());
              obs.observe(document.documentElement, { childList: true, subtree: true });

              window.addEventListener('DOMContentLoaded', logOverlay);
              // Attempt immediately as overlay may already exist
              logOverlay();
            } catch (e) {
              console.warn('[Vite Overlay logger failed]', e);
            }
          })();`
        }
      ]
    };
  }
});
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3e3
  },
  plugins: [
    react(),
    logErrorsPlugin(),
    mode === "development" && componentTaggerPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3Zpc3VhbC1lZGl0cy9jb21wb25lbnQtdGFnZ2VyLXBsdWdpbi5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlclBsdWdpbiB9IGZyb20gXCIuL3NyYy92aXN1YWwtZWRpdHMvY29tcG9uZW50LXRhZ2dlci1wbHVnaW4uanNcIjtcblxuLy8gTWluaW1hbCBwbHVnaW4gdG8gbG9nIGJ1aWxkLXRpbWUgYW5kIGRldi10aW1lIGVycm9ycyB0byBjb25zb2xlXG5jb25zdCBsb2dFcnJvcnNQbHVnaW4gPSAoKSA9PiAoe1xuICBuYW1lOiBcImxvZy1lcnJvcnMtcGx1Z2luXCIsXG4gIC8vIEluamVjdCBhIHNtYWxsIGNsaWVudC1zaWRlIHNjcmlwdCB0aGF0IG1pcnJvcnMgVml0ZSBvdmVybGF5IGVycm9ycyB0byBjb25zb2xlXG4gIHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGFnczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGFnOiBcInNjcmlwdFwiLFxuICAgICAgICAgIGluamVjdFRvOiBcImhlYWRcIixcbiAgICAgICAgICBjaGlsZHJlbjogYCgoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBsb2dPdmVybGF5ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcigndml0ZS1lcnJvci1vdmVybGF5Jyk7XG4gICAgICAgICAgICAgICAgaWYgKCFlbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3QgPSAoZWwuc2hhZG93Um9vdCB8fCBlbCk7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSAnJztcbiAgICAgICAgICAgICAgICB0cnkgeyB0ZXh0ID0gcm9vdC50ZXh0Q29udGVudCB8fCAnJzsgfSBjYXRjaCAoXykge31cbiAgICAgICAgICAgICAgICBpZiAodGV4dCAmJiB0ZXh0LnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbXNnID0gdGV4dC50cmltKCk7XG4gICAgICAgICAgICAgICAgICAvLyBVc2UgY29uc29sZS5lcnJvciB0byBzdXJmYWNlIGNsZWFybHkgaW4gRGV2VG9vbHNcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWaXRlIE92ZXJsYXldJywgbXNnKTtcbiAgICAgICAgICAgICAgICAgIC8vIEFsc28gbWlycm9yIHRvIHBhcmVudCBpZnJhbWUgd2l0aCBzdHJ1Y3R1cmVkIHBheWxvYWRcbiAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3cucGFyZW50ICYmIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0VSUk9SX0NBUFRVUkVEJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2s6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG5vOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogJ3ZpdGUub3ZlcmxheScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICAgIH0sICcqJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF8pIHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGNvbnN0IG9icyA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IGxvZ092ZXJsYXkoKSk7XG4gICAgICAgICAgICAgIG9icy5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBsb2dPdmVybGF5KTtcbiAgICAgICAgICAgICAgLy8gQXR0ZW1wdCBpbW1lZGlhdGVseSBhcyBvdmVybGF5IG1heSBhbHJlYWR5IGV4aXN0XG4gICAgICAgICAgICAgIGxvZ092ZXJsYXkoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbVml0ZSBPdmVybGF5IGxvZ2dlciBmYWlsZWRdJywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkoKTtgXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9LFxufSk7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogMzAwMCxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbG9nRXJyb3JzUGx1Z2luKCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJiBjb21wb25lbnRUYWdnZXJQbHVnaW4oKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc3JjL3Zpc3VhbC1lZGl0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zcmMvdmlzdWFsLWVkaXRzL2NvbXBvbmVudC10YWdnZXItcGx1Z2luLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc3JjL3Zpc3VhbC1lZGl0cy9jb21wb25lbnQtdGFnZ2VyLXBsdWdpbi5qc1wiO2ltcG9ydCB7IHBhcnNlIH0gZnJvbSAnQGJhYmVsL3BhcnNlcic7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7IHdhbGsgfSBmcm9tICdlc3RyZWUtd2Fsa2VyJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgQmxhY2tsaXN0cyAqL1xuY29uc3QgdGhyZWVGaWJlckVsZW1zID0gW1xuICAgIFwib2JqZWN0M0RcIixcbiAgICBcImF1ZGlvTGlzdGVuZXJcIixcbiAgICBcInBvc2l0aW9uYWxBdWRpb1wiLFxuICAgIFwibWVzaFwiLFxuICAgIFwiYmF0Y2hlZE1lc2hcIixcbiAgICBcImluc3RhbmNlZE1lc2hcIixcbiAgICBcInNjZW5lXCIsXG4gICAgXCJzcHJpdGVcIixcbiAgICBcImxPRFwiLFxuICAgIFwic2tpbm5lZE1lc2hcIixcbiAgICBcInNrZWxldG9uXCIsXG4gICAgXCJib25lXCIsXG4gICAgXCJsaW5lU2VnbWVudHNcIixcbiAgICBcImxpbmVMb29wXCIsXG4gICAgXCJwb2ludHNcIixcbiAgICBcImdyb3VwXCIsXG4gICAgXCJjYW1lcmFcIixcbiAgICBcInBlcnNwZWN0aXZlQ2FtZXJhXCIsXG4gICAgXCJvcnRob2dyYXBoaWNDYW1lcmFcIixcbiAgICBcImN1YmVDYW1lcmFcIixcbiAgICBcImFycmF5Q2FtZXJhXCIsXG4gICAgXCJpbnN0YW5jZWRCdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwiYnVmZmVyR2VvbWV0cnlcIixcbiAgICBcImJveEJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJjaXJjbGVCdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwiY29uZUJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJjeWxpbmRlckJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJkb2RlY2FoZWRyb25CdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwiZXh0cnVkZUJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJpY29zYWhlZHJvbkJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJsYXRoZUJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJvY3RhaGVkcm9uQnVmZmVyR2VvbWV0cnlcIixcbiAgICBcInBsYW5lQnVmZmVyR2VvbWV0cnlcIixcbiAgICBcInBvbHloZWRyb25CdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwicmluZ0J1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJzaGFwZUJ1ZmZlckdlb21ldHJ5XCIsXG4gICAgXCJzcGhlcmVCdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwidGV0cmFoZWRyb25CdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwidG9ydXNCdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwidG9ydXNLbm90QnVmZmVyR2VvbWV0cnlcIixcbiAgICBcInR1YmVCdWZmZXJHZW9tZXRyeVwiLFxuICAgIFwid2lyZWZyYW1lR2VvbWV0cnlcIixcbiAgICBcInRldHJhaGVkcm9uR2VvbWV0cnlcIixcbiAgICBcIm9jdGFoZWRyb25HZW9tZXRyeVwiLFxuICAgIFwiaWNvc2FoZWRyb25HZW9tZXRyeVwiLFxuICAgIFwiZG9kZWNhaGVkcm9uR2VvbWV0cnlcIixcbiAgICBcInBvbHloZWRyb25HZW9tZXRyeVwiLFxuICAgIFwidHViZUdlb21ldHJ5XCIsXG4gICAgXCJ0b3J1c0tub3RHZW9tZXRyeVwiLFxuICAgIFwidG9ydXNHZW9tZXRyeVwiLFxuICAgIFwic3BoZXJlR2VvbWV0cnlcIixcbiAgICBcInJpbmdHZW9tZXRyeVwiLFxuICAgIFwicGxhbmVHZW9tZXRyeVwiLFxuICAgIFwibGF0aGVHZW9tZXRyeVwiLFxuICAgIFwic2hhcGVHZW9tZXRyeVwiLFxuICAgIFwiZXh0cnVkZUdlb21ldHJ5XCIsXG4gICAgXCJlZGdlc0dlb21ldHJ5XCIsXG4gICAgXCJjb25lR2VvbWV0cnlcIixcbiAgICBcImN5bGluZGVyR2VvbWV0cnlcIixcbiAgICBcImNpcmNsZUdlb21ldHJ5XCIsXG4gICAgXCJib3hHZW9tZXRyeVwiLFxuICAgIFwiY2Fwc3VsZUdlb21ldHJ5XCIsXG4gICAgXCJtYXRlcmlhbFwiLFxuICAgIFwic2hhZG93TWF0ZXJpYWxcIixcbiAgICBcInNwcml0ZU1hdGVyaWFsXCIsXG4gICAgXCJyYXdTaGFkZXJNYXRlcmlhbFwiLFxuICAgIFwic2hhZGVyTWF0ZXJpYWxcIixcbiAgICBcInBvaW50c01hdGVyaWFsXCIsXG4gICAgXCJtZXNoUGh5c2ljYWxNYXRlcmlhbFwiLFxuICAgIFwibWVzaFN0YW5kYXJkTWF0ZXJpYWxcIixcbiAgICBcIm1lc2hQaG9uZ01hdGVyaWFsXCIsXG4gICAgXCJtZXNoVG9vbk1hdGVyaWFsXCIsXG4gICAgXCJtZXNoTm9ybWFsTWF0ZXJpYWxcIixcbiAgICBcIm1lc2hMYW1iZXJ0TWF0ZXJpYWxcIixcbiAgICBcIm1lc2hEZXB0aE1hdGVyaWFsXCIsXG4gICAgXCJtZXNoRGlzdGFuY2VNYXRlcmlhbFwiLFxuICAgIFwibWVzaEJhc2ljTWF0ZXJpYWxcIixcbiAgICBcIm1lc2hNYXRjYXBNYXRlcmlhbFwiLFxuICAgIFwibGluZURhc2hlZE1hdGVyaWFsXCIsXG4gICAgXCJsaW5lQmFzaWNNYXRlcmlhbFwiLFxuICAgIFwicHJpbWl0aXZlXCIsXG4gICAgXCJsaWdodFwiLFxuICAgIFwic3BvdExpZ2h0U2hhZG93XCIsXG4gICAgXCJzcG90TGlnaHRcIixcbiAgICBcInBvaW50TGlnaHRcIixcbiAgICBcInJlY3RBcmVhTGlnaHRcIixcbiAgICBcImhlbWlzcGhlcmVMaWdodFwiLFxuICAgIFwiZGlyZWN0aW9uYWxMaWdodFNoYWRvd1wiLFxuICAgIFwiZGlyZWN0aW9uYWxMaWdodFwiLFxuICAgIFwiYW1iaWVudExpZ2h0XCIsXG4gICAgXCJsaWdodFNoYWRvd1wiLFxuICAgIFwiYW1iaWVudExpZ2h0UHJvYmVcIixcbiAgICBcImhlbWlzcGhlcmVMaWdodFByb2JlXCIsXG4gICAgXCJsaWdodFByb2JlXCIsXG4gICAgXCJzcG90TGlnaHRIZWxwZXJcIixcbiAgICBcInNrZWxldG9uSGVscGVyXCIsXG4gICAgXCJwb2ludExpZ2h0SGVscGVyXCIsXG4gICAgXCJoZW1pc3BoZXJlTGlnaHRIZWxwZXJcIixcbiAgICBcImdyaWRIZWxwZXJcIixcbiAgICBcInBvbGFyR3JpZEhlbHBlclwiLFxuICAgIFwiZGlyZWN0aW9uYWxMaWdodEhlbHBlclwiLFxuICAgIFwiY2FtZXJhSGVscGVyXCIsXG4gICAgXCJib3hIZWxwZXJcIixcbiAgICBcImJveDNIZWxwZXJcIixcbiAgICBcInBsYW5lSGVscGVyXCIsXG4gICAgXCJhcnJvd0hlbHBlclwiLFxuICAgIFwiYXhlc0hlbHBlclwiLFxuICAgIFwidGV4dHVyZVwiLFxuICAgIFwidmlkZW9UZXh0dXJlXCIsXG4gICAgXCJkYXRhVGV4dHVyZVwiLFxuICAgIFwiZGF0YVRleHR1cmUzRFwiLFxuICAgIFwiY29tcHJlc3NlZFRleHR1cmVcIixcbiAgICBcImN1YmVUZXh0dXJlXCIsXG4gICAgXCJjYW52YXNUZXh0dXJlXCIsXG4gICAgXCJkZXB0aFRleHR1cmVcIixcbiAgICBcInJheWNhc3RlclwiLFxuICAgIFwidmVjdG9yMlwiLFxuICAgIFwidmVjdG9yM1wiLFxuICAgIFwidmVjdG9yNFwiLFxuICAgIFwiZXVsZXJcIixcbiAgICBcIm1hdHJpeDNcIixcbiAgICBcIm1hdHJpeDRcIixcbiAgICBcInF1YXRlcm5pb25cIixcbiAgICBcImJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiZmxvYXQxNkJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiZmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiZmxvYXQ2NEJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiaW50OEJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiaW50MTZCdWZmZXJBdHRyaWJ1dGVcIixcbiAgICBcImludDMyQnVmZmVyQXR0cmlidXRlXCIsXG4gICAgXCJ1aW50OEJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwidWludDE2QnVmZmVyQXR0cmlidXRlXCIsXG4gICAgXCJ1aW50MzJCdWZmZXJBdHRyaWJ1dGVcIixcbiAgICBcImluc3RhbmNlZEJ1ZmZlckF0dHJpYnV0ZVwiLFxuICAgIFwiY29sb3JcIixcbiAgICBcImZvZ1wiLFxuICAgIFwiZm9nRXhwMlwiLFxuICAgIFwic2hhcGVcIixcbiAgICBcImNvbG9yU2hpZnRNYXRlcmlhbFwiXG5dO1xuXG5jb25zdCBkcmVpRWxlbXMgPSBbXG4gICAgXCJBc2NpaVJlbmRlcmVyXCIsXG4gICAgXCJCaWxsYm9hcmRcIixcbiAgICBcIkNsb25lXCIsXG4gICAgXCJDb21wdXRlZEF0dHJpYnV0ZVwiLFxuICAgIFwiRGVjYWxcIixcbiAgICBcIkVkZ2VzXCIsXG4gICAgXCJFZmZlY3RzXCIsXG4gICAgXCJHcmFkaWVudFRleHR1cmVcIixcbiAgICBcIk1hcmNoaW5nQ3ViZXNcIixcbiAgICBcIk91dGxpbmVzXCIsXG4gICAgXCJQb3NpdGlvbmFsQXVkaW9cIixcbiAgICBcIlNhbXBsZXJcIixcbiAgICBcIlNjcmVlblNpemVyXCIsXG4gICAgXCJTY3JlZW5TcGFjZVwiLFxuICAgIFwiU3BsYXRcIixcbiAgICBcIlN2Z1wiLFxuICAgIFwiVGV4dFwiLFxuICAgIFwiVGV4dDNEXCIsXG4gICAgXCJUcmFpbFwiLFxuICAgIFwiQ3ViZUNhbWVyYVwiLFxuICAgIFwiT3J0aG9ncmFwaGljQ2FtZXJhXCIsXG4gICAgXCJQZXJzcGVjdGl2ZUNhbWVyYVwiLFxuICAgIFwiQ2FtZXJhQ29udHJvbHNcIixcbiAgICBcIkZhY2VDb250cm9sc1wiLFxuICAgIFwiS2V5Ym9hcmRDb250cm9sc1wiLFxuICAgIFwiTW90aW9uUGF0aENvbnRyb2xzXCIsXG4gICAgXCJQcmVzZW50YXRpb25Db250cm9sc1wiLFxuICAgIFwiU2Nyb2xsQ29udHJvbHNcIixcbiAgICBcIkRyYWdDb250cm9sc1wiLFxuICAgIFwiR2l6bW9IZWxwZXJcIixcbiAgICBcIkdyaWRcIixcbiAgICBcIkhlbHBlclwiLFxuICAgIFwiUGl2b3RDb250cm9sc1wiLFxuICAgIFwiVHJhbnNmb3JtQ29udHJvbHNcIixcbiAgICBcIkN1YmVUZXh0dXJlXCIsXG4gICAgXCJGYnhcIixcbiAgICBcIkdsdGZcIixcbiAgICBcIkt0eDJcIixcbiAgICBcIkxvYWRlclwiLFxuICAgIFwiUHJvZ3Jlc3NcIixcbiAgICBcIlNjcmVlblZpZGVvVGV4dHVyZVwiLFxuICAgIFwiVGV4dHVyZVwiLFxuICAgIFwiVHJhaWxUZXh0dXJlXCIsXG4gICAgXCJWaWRlb1RleHR1cmVcIixcbiAgICBcIldlYmNhbVZpZGVvVGV4dHVyZVwiLFxuICAgIFwiQ3ljbGVSYXljYXN0XCIsXG4gICAgXCJEZXRlY3RHUFVcIixcbiAgICBcIkV4YW1wbGVcIixcbiAgICBcIkZhY2VMYW5kbWFya2VyXCIsXG4gICAgXCJGYm9cIixcbiAgICBcIkh0bWxcIixcbiAgICBcIlNlbGVjdFwiLFxuICAgIFwiU3ByaXRlQW5pbWF0b3JcIixcbiAgICBcIlN0YXRzR2xcIixcbiAgICBcIlN0YXRzXCIsXG4gICAgXCJUcmFpbFwiLFxuICAgIFwiV2lyZWZyYW1lXCIsXG4gICAgXCJDdXJ2ZU1vZGlmaWVyXCIsXG4gICAgXCJBZGFwdGl2ZURwclwiLFxuICAgIFwiQWRhcHRpdmVFdmVudHNcIixcbiAgICBcIkJha2VTaGFkb3dzXCIsXG4gICAgXCJCdmhcIixcbiAgICBcIkRldGFpbGVkXCIsXG4gICAgXCJJbnN0YW5jZXNcIixcbiAgICBcIk1lcmdlZFwiLFxuICAgIFwibWVzaEJvdW5kc1wiLFxuICAgIFwiUGVyZm9ybWFuY2VNb25pdG9yXCIsXG4gICAgXCJQb2ludHNcIixcbiAgICBcIlByZWxvYWRcIixcbiAgICBcIlNlZ21lbnRzXCIsXG4gICAgXCJGaXNoZXllXCIsXG4gICAgXCJIdWRcIixcbiAgICBcIk1hc2tcIixcbiAgICBcIk1lc2hQb3J0YWxNYXRlcmlhbFwiLFxuICAgIFwiUmVuZGVyQ3ViZVRleHR1cmVcIixcbiAgICBcIlJlbmRlclRleHR1cmVcIixcbiAgICBcIlZpZXdcIixcbiAgICBcIk1lc2hEaXNjYXJkTWF0ZXJpYWxcIixcbiAgICBcIk1lc2hEaXN0b3J0TWF0ZXJpYWxcIixcbiAgICBcIk1lc2hSZWZsZWN0b3JNYXRlcmlhbFwiLFxuICAgIFwiTWVzaFJlZnJhY3Rpb25NYXRlcmlhbFwiLFxuICAgIFwiTWVzaFRyYW5zbWlzc2lvbk1hdGVyaWFsXCIsXG4gICAgXCJNZXNoV29iYmxlTWF0ZXJpYWxcIixcbiAgICBcIlBvaW50TWF0ZXJpYWxcIixcbiAgICBcInNoYWRlck1hdGVyaWFsXCIsXG4gICAgXCJTb2Z0U2hhZG93c1wiLFxuICAgIFwiQ2F0bXVsbFJvbUxpbmVcIixcbiAgICBcIkN1YmljQmV6aWVyTGluZVwiLFxuICAgIFwiRmFjZW1lc2hcIixcbiAgICBcIkxpbmVcIixcbiAgICBcIk1lc2hcIixcbiAgICBcIlF1YWRyYXRpY0JlemllckxpbmVcIixcbiAgICBcIlJvdW5kZWRCb3hcIixcbiAgICBcIlNjcmVlblF1YWRcIixcbiAgICBcIkFjY3VtdWxhdGl2ZVNoYWRvd3NcIixcbiAgICBcIkJhY2tkcm9wXCIsXG4gICAgXCJCQkFuY2hvclwiLFxuICAgIFwiQm91bmRzXCIsXG4gICAgXCJDYW1lcmFTaGFrZVwiLFxuICAgIFwiQ2F1c3RpY3NcIixcbiAgICBcIkNlbnRlclwiLFxuICAgIFwiQ2xvdWRcIixcbiAgICBcIkNvbnRhY3RTaGFkb3dzXCIsXG4gICAgXCJFbnZpcm9ubWVudFwiLFxuICAgIFwiRmxvYXRcIixcbiAgICBcIkxpZ2h0Zm9ybWVyXCIsXG4gICAgXCJNYXRjYXBUZXh0dXJlXCIsXG4gICAgXCJOb3JtYWxUZXh0dXJlXCIsXG4gICAgXCJSYW5kb21pemVkTGlnaHRcIixcbiAgICBcIlJlc2l6ZVwiLFxuICAgIFwiU2hhZG93QWxwaGFcIixcbiAgICBcIlNoYWRvd1wiLFxuICAgIFwiU2t5XCIsXG4gICAgXCJTcGFya2xlc1wiLFxuICAgIFwiU3BvdExpZ2h0U2hhZG93XCIsXG4gICAgXCJTcG90TGlnaHRcIixcbiAgICBcIlN0YWdlXCIsXG4gICAgXCJTdGFyc1wiLFxuICAgIFwiT3JiaXRDb250cm9sc1wiXG5dO1xuXG5jb25zdCBzaG91bGRUYWcgPSAobmFtZSkgPT4gIXRocmVlRmliZXJFbGVtcy5pbmNsdWRlcyhuYW1lKSAmJiAhZHJlaUVsZW1zLmluY2x1ZGVzKG5hbWUpO1xuXG4vLyBcdTI3OTUgQ29sbGVjdCBhbGlhc2VzIG9mIHRoZSBOZXh0LmpzIDxJbWFnZT4gY29tcG9uZW50IHNvIHdlIGNhbiByZWxpYWJseSB0YWcgaXQgZXZlbiBpZiBpdCB3YXMgcmVuYW1lZC5cbmNvbnN0IGlzTmV4dEltYWdlQWxpYXMgPSAoYWxpYXNlcywgbmFtZSkgPT4gYWxpYXNlcy5oYXMobmFtZSk7XG5cbmNvbnN0IGV4dHJhY3RMaXRlcmFsVmFsdWUgPSAobm9kZSkgPT4ge1xuICAgIGlmICghbm9kZSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgICBjYXNlICdTdHJpbmdMaXRlcmFsJzpcbiAgICAgICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgICAgICBjYXNlICdOdW1lcmljTGl0ZXJhbCc6XG4gICAgICAgICAgICByZXR1cm4gbm9kZS52YWx1ZTtcbiAgICAgICAgY2FzZSAnQm9vbGVhbkxpdGVyYWwnOlxuICAgICAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gICAgICAgIGNhc2UgJ09iamVjdEV4cHJlc3Npb24nOlxuICAgICAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2Ygbm9kZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3AudHlwZSA9PT0gJ09iamVjdFByb3BlcnR5JyAmJiAhcHJvcC5jb21wdXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBwcm9wLmtleS50eXBlID09PSAnSWRlbnRpZmllcicgPyBwcm9wLmtleS5uYW1lIDogcHJvcC5rZXkudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gZXh0cmFjdExpdGVyYWxWYWx1ZShwcm9wLnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICBjYXNlICdBcnJheUV4cHJlc3Npb24nOlxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuZWxlbWVudHMubWFwKChlbCkgPT4gZXh0cmFjdExpdGVyYWxWYWx1ZShlbCkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59O1xuXG5jb25zdCBmaW5kVmFyaWFibGVEZWNsYXJhdGlvbnMgPSAoYXN0KSA9PiB7XG4gICAgY29uc3QgdmFyaWFibGVzID0gbmV3IE1hcCgpO1xuICAgIHdhbGsoYXN0LCB7XG4gICAgICAgIGVudGVyKG5vZGUpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjb25zdC9sZXQvdmFyIGRlY2xhcmF0aW9uc1xuICAgICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ1ZhcmlhYmxlRGVjbGFyYXRpb24nKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBkZWNsYXJhdG9yIG9mIG5vZGUuZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWNsYXJhdG9yLmlkLnR5cGUgPT09ICdJZGVudGlmaWVyJyAmJiBkZWNsYXJhdG9yLmluaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhck5hbWUgPSBkZWNsYXJhdG9yLmlkLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGV4dHJhY3RMaXRlcmFsVmFsdWUoZGVjbGFyYXRvci5pbml0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5zZXQodmFyTmFtZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHZhck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyAnYXJyYXknIDogdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyA/ICdvYmplY3QnIDogJ3ByaW1pdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlJdGVtczogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2M6IGRlY2xhcmF0b3IubG9jPy5zdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdmFyaWFibGVzO1xufTtcblxuY29uc3QgZmluZE1hcENvbnRleHQgPSAobm9kZSwgdmFyaWFibGVzKSA9PiB7XG4gICAgLy8gV2FsayB1cCB0aGUgdHJlZSB0byBmaW5kIGlmIHRoaXMgSlNYIGVsZW1lbnQgaXMgaW5zaWRlIGEgbWFwIGNhbGxcbiAgICBsZXQgY3VycmVudCA9IG5vZGU7XG4gICAgbGV0IGRlcHRoID0gMDtcbiAgICBjb25zdCBtYXhEZXB0aCA9IDEwOyAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3BzXG4gICAgXG4gICAgd2hpbGUgKGN1cnJlbnQgJiYgZGVwdGggPCBtYXhEZXB0aCkge1xuICAgICAgICBpZiAoY3VycmVudC50eXBlID09PSAnQ2FsbEV4cHJlc3Npb24nICYmXG4gICAgICAgICAgICBjdXJyZW50LmNhbGxlZT8udHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nICYmXG4gICAgICAgICAgICBjdXJyZW50LmNhbGxlZT8ucHJvcGVydHk/Lm5hbWUgPT09ICdtYXAnKSB7XG4gICAgICAgICAgICAvLyBGb3VuZCBhIC5tYXAoKSBjYWxsLCBjaGVjayBpZiBpdCdzIG9uIGEga25vd24gYXJyYXlcbiAgICAgICAgICAgIGNvbnN0IGFycmF5TmFtZSA9IGN1cnJlbnQuY2FsbGVlLm9iamVjdD8ubmFtZTtcbiAgICAgICAgICAgIGNvbnN0IG1hcENhbGxiYWNrID0gY3VycmVudC5hcmd1bWVudHM/LlswXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGFycmF5TmFtZSAmJiBtYXBDYWxsYmFjaz8udHlwZSA9PT0gJ0Fycm93RnVuY3Rpb25FeHByZXNzaW9uJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1QYXJhbSA9IG1hcENhbGxiYWNrLnBhcmFtcz8uWzBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4UGFyYW0gPSBtYXBDYWxsYmFjay5wYXJhbXM/LlsxXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVBhcmFtPy50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFySW5mbyA9IHZhcmlhYmxlcy5nZXQoYXJyYXlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1WYXJOYW1lOiBpdGVtUGFyYW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5SXRlbXM6IHZhckluZm8/LmFycmF5SXRlbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheUxvYzogdmFySW5mbz8ubG9jLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhWYXJOYW1lOiBpbmRleFBhcmFtPy50eXBlID09PSAnSWRlbnRpZmllcicgPyBpbmRleFBhcmFtLm5hbWUgOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICBkZXB0aCsrO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbmNvbnN0IGdldFNlbWFudGljTmFtZSA9IChub2RlLCBtYXBDb250ZXh0LCBpbWFnZUFsaWFzZXMpID0+IHtcbiAgICBjb25zdCBnZXROYW1lID0gKCkgPT4ge1xuICAgICAgICBpZiAobm9kZS5uYW1lLnR5cGUgPT09ICdKU1hJZGVudGlmaWVyJykgcmV0dXJuIG5vZGUubmFtZS5uYW1lO1xuICAgICAgICBpZiAobm9kZS5uYW1lLnR5cGUgPT09ICdKU1hNZW1iZXJFeHByZXNzaW9uJykgXG4gICAgICAgICAgICByZXR1cm4gYCR7bm9kZS5uYW1lLm9iamVjdC5uYW1lfS4ke25vZGUubmFtZS5wcm9wZXJ0eS5uYW1lfWA7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgXG4gICAgY29uc3QgdGFnTmFtZSA9IGdldE5hbWUoKTtcbiAgICBpZiAoIXRhZ05hbWUpIHJldHVybiBudWxsO1xuICAgIFxuICAgIC8vIEZvciBOZXh0LmpzIEltYWdlIGNvbXBvbmVudHMsIGFsd2F5cyByZXR1cm4gJ2ltZycgc28gdGhlIG5hbWUgaXMgYSB2YWxpZCBIVE1MIHRhZy5cbiAgICBpZiAoaXNOZXh0SW1hZ2VBbGlhcyhpbWFnZUFsaWFzZXMsIHRhZ05hbWUpKSB7XG4gICAgICAgIHJldHVybiAnaW1nJztcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRhZ05hbWU7XG59O1xuXG4vKiBcdUQ4M0RcdURFODAgTWFpbiB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvblxuXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1Tb3VyY2Uoc3JjLCBmaWxlbmFtZSkge1xuICAgIGlmICgvbm9kZV9tb2R1bGVzLy50ZXN0KGZpbGVuYW1lKSkge1xuICAgICAgICByZXR1cm4geyBjb2RlOiBzcmMgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhc3QgPSBwYXJzZShzcmMsIHtcbiAgICAgICAgICAgIHNvdXJjZVR5cGU6ICdtb2R1bGUnLFxuICAgICAgICAgICAgcGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG1zID0gbmV3IE1hZ2ljU3RyaW5nKHNyYyk7XG4gICAgICAgIGNvbnN0IHJlbCA9IHBhdGgucmVsYXRpdmUocHJvY2Vzcy5jd2QoKSwgZmlsZW5hbWUpO1xuICAgICAgICBsZXQgbXV0YXRlZCA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgLy8gQWRkIHBhcmVudCByZWZlcmVuY2VzIHRvIEFTVCBub2RlcyBmb3IgdXB3YXJkIHRyYXZlcnNhbCAobm9uLWVudW1lcmFibGUgdG8gYXZvaWQgaW5maW5pdGUgcmVjdXJzaW9uKVxuICAgICAgICB3YWxrKGFzdCwge1xuICAgICAgICAgICAgZW50ZXIobm9kZSwgcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudCAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5vZGUsICdwYXJlbnQnKSkge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobm9kZSwgJ3BhcmVudCcsIHsgdmFsdWU6IHBhcmVudCwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIDBcdUZFMEZcdTIwRTMgQ29sbGVjdCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgZmlyc3RcbiAgICAgICAgY29uc3QgdmFyaWFibGVzID0gZmluZFZhcmlhYmxlRGVjbGFyYXRpb25zKGFzdCk7XG4gICAgICAgIFxuICAgICAgICAvLyAxXHVGRTBGXHUyMEUzIEdhdGhlciBsb2NhbCBpZGVudGlmaWVycyB0aGF0IHJlZmVyZW5jZSBgbmV4dC9pbWFnZWAuXG4gICAgICAgIGNvbnN0IGltYWdlQWxpYXNlcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgd2Fsayhhc3QsIHtcbiAgICAgICAgICAgIGVudGVyKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlID09PSAnSW1wb3J0RGVjbGFyYXRpb24nICYmXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc291cmNlLnZhbHVlID09PSAnbmV4dC9pbWFnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzcGVjIG9mIG5vZGUuc3BlY2lmaWVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VBbGlhc2VzLmFkZChzcGVjLmxvY2FsLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyAyXHVGRTBGXHUyMEUzIEluamVjdCBhdHRyaWJ1dGVzIHdpdGggZW5oYW5jZWQgc2VtYW50aWMgY29udGV4dC5cbiAgICAgICAgd2Fsayhhc3QsIHtcbiAgICAgICAgICAgIGVudGVyKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS50eXBlICE9PSAnSlNYT3BlbmluZ0VsZW1lbnQnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgbWFwQ29udGV4dCA9IGZpbmRNYXBDb250ZXh0KG5vZGUsIHZhcmlhYmxlcyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VtYW50aWNOYW1lID0gZ2V0U2VtYW50aWNOYW1lKG5vZGUsIG1hcENvbnRleHQsIGltYWdlQWxpYXNlcyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCFzZW1hbnRpY05hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgWydGcmFnbWVudCcsICdSZWFjdC5GcmFnbWVudCddLmluY2x1ZGVzKHNlbWFudGljTmFtZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCFpc05leHRJbWFnZUFsaWFzKGltYWdlQWxpYXNlcywgc2VtYW50aWNOYW1lLnNwbGl0KCctJylbMF0pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhc2hvdWxkVGFnKHNlbWFudGljTmFtZSkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgeyBsaW5lLCBjb2x1bW4gfSA9IG5vZGUubG9jLnN0YXJ0O1xuICAgICAgICAgICAgICAgIGxldCBvcmNoaWRzSWQgPSBgJHtyZWx9OiR7bGluZX06JHtjb2x1bW59YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBFbmhhbmNlIHRoZSBJRCB3aXRoIGNvbnRleHQgaWYgd2UgaGF2ZSBtYXAgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICBpZiAobWFwQ29udGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBvcmNoaWRzSWQgKz0gYEAke21hcENvbnRleHQuYXJyYXlOYW1lfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFx1RDgzRFx1REQwRCBBcHBlbmQgcmVmZXJlbmNlZCB2YXJpYWJsZSBsb2NhdGlvbnMgZm9yIHNpbXBsZSBpZGVudGlmaWVyIHJlZmVyZW5jZXMgaW4gcHJvcHNcbiAgICAgICAgICAgICAgICBub2RlLmF0dHJpYnV0ZXM/LmZvckVhY2goKGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIudHlwZSA9PT0gJ0pTWEF0dHJpYnV0ZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHIudmFsdWU/LnR5cGUgPT09ICdKU1hFeHByZXNzaW9uQ29udGFpbmVyJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ci52YWx1ZS5leHByZXNzaW9uPy50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZk5hbWUgPSBhdHRyLnZhbHVlLmV4cHJlc3Npb24ubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhckluZm8gPSB2YXJpYWJsZXMuZ2V0KHJlZk5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFySW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yY2hpZHNJZCArPSBgQCR7cmVmTmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gXHVEODNEXHVEQ0NEIElmIGluc2lkZSBhIG1hcCBjb250ZXh0IGFuZCB3ZSBoYXZlIGFuIGluZGV4IHZhcmlhYmxlLCBpbmplY3QgZGF0YS1tYXAtaW5kZXhcbiAgICAgICAgICAgICAgICBpZiAobWFwQ29udGV4dD8uaW5kZXhWYXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIG1zLmFwcGVuZExlZnQobm9kZS5uYW1lLmVuZCwgYCBkYXRhLW1hcC1pbmRleD17JHttYXBDb250ZXh0LmluZGV4VmFyTmFtZX19YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1zLmFwcGVuZExlZnQobm9kZS5uYW1lLmVuZCwgYCBkYXRhLW9yY2hpZHMtaWQ9XCIke29yY2hpZHNJZH1cIiBkYXRhLW9yY2hpZHMtbmFtZT1cIiR7c2VtYW50aWNOYW1lfVwiYCk7XG4gICAgICAgICAgICAgICAgbXV0YXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChtdXRhdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvZGU6IG1zLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgbWFwOiBtcy5nZW5lcmF0ZU1hcCh7IGhpcmVzOiB0cnVlIH0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4geyBjb2RlOiBzcmMgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW2NvbXBvbmVudFRhZ2dlcl0gUGFyc2UgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgcmV0dXJuIHsgY29kZTogc3JjIH07XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50VGFnZ2VyUGx1Z2luKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6ICdjb21wb25lbnQtdGFnZ2VyJyxcbiAgICAgICAgZW5mb3JjZTogJ3ByZScsXG4gICAgICAgIHRyYW5zZm9ybShzcmMsIGlkKSB7XG4gICAgICAgICAgICBpZiAoaWQuZW5kc1dpdGgoJy5qc3gnKSB8fCBpZC5lbmRzV2l0aCgnLnRzeCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVNvdXJjZShzcmMsIGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPQSxXQUFVOzs7QUNGbVIsU0FBUyxhQUFhO0FBQzFULE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsWUFBWTtBQUNyQixPQUFPLFVBQVU7QUFHakIsSUFBTSxrQkFBa0I7QUFBQSxFQUNwQjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNKO0FBRUEsSUFBTSxZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDSjtBQUVBLElBQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsU0FBUyxJQUFJLEtBQUssQ0FBQyxVQUFVLFNBQVMsSUFBSTtBQUd2RixJQUFNLG1CQUFtQixDQUFDLFNBQVMsU0FBUyxRQUFRLElBQUksSUFBSTtBQUU1RCxJQUFNLHNCQUFzQixDQUFDLFNBQVM7QUFDbEMsTUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixVQUFRLEtBQUssTUFBTTtBQUFBLElBQ2YsS0FBSztBQUNELGFBQU8sS0FBSztBQUFBLElBQ2hCLEtBQUs7QUFDRCxhQUFPLEtBQUs7QUFBQSxJQUNoQixLQUFLO0FBQ0QsYUFBTyxLQUFLO0FBQUEsSUFDaEIsS0FBSztBQUNELFlBQU0sTUFBTSxDQUFDO0FBQ2IsaUJBQVcsUUFBUSxLQUFLLFlBQVk7QUFDaEMsWUFBSSxLQUFLLFNBQVMsb0JBQW9CLENBQUMsS0FBSyxVQUFVO0FBQ2xELGdCQUFNLE1BQU0sS0FBSyxJQUFJLFNBQVMsZUFBZSxLQUFLLElBQUksT0FBTyxLQUFLLElBQUk7QUFDdEUsY0FBSSxHQUFHLElBQUksb0JBQW9CLEtBQUssS0FBSztBQUFBLFFBQzdDO0FBQUEsTUFDSjtBQUNBLGFBQU87QUFBQSxJQUNYLEtBQUs7QUFDRCxhQUFPLEtBQUssU0FBUyxJQUFJLENBQUMsT0FBTyxvQkFBb0IsRUFBRSxDQUFDO0FBQUEsSUFDNUQ7QUFDSSxhQUFPO0FBQUEsRUFDZjtBQUNKO0FBRUEsSUFBTSwyQkFBMkIsQ0FBQyxRQUFRO0FBQ3RDLFFBQU0sWUFBWSxvQkFBSSxJQUFJO0FBQzFCLE9BQUssS0FBSztBQUFBLElBQ04sTUFBTSxNQUFNO0FBRVIsVUFBSSxLQUFLLFNBQVMsdUJBQXVCO0FBQ3JDLG1CQUFXLGNBQWMsS0FBSyxjQUFjO0FBQ3hDLGNBQUksV0FBVyxHQUFHLFNBQVMsZ0JBQWdCLFdBQVcsTUFBTTtBQUN4RCxrQkFBTSxVQUFVLFdBQVcsR0FBRztBQUM5QixrQkFBTSxRQUFRLG9CQUFvQixXQUFXLElBQUk7QUFDakQsc0JBQVUsSUFBSSxTQUFTO0FBQUEsY0FDbkIsTUFBTTtBQUFBLGNBQ04sTUFBTSxNQUFNLFFBQVEsS0FBSyxJQUFJLFVBQVUsT0FBTyxVQUFVLFdBQVcsV0FBVztBQUFBLGNBQzlFO0FBQUEsY0FDQSxZQUFZLE1BQU0sUUFBUSxLQUFLLElBQUksUUFBUTtBQUFBLGNBQzNDLEtBQUssV0FBVyxLQUFLO0FBQUEsWUFDekIsQ0FBQztBQUFBLFVBQ0w7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKLENBQUM7QUFDRCxTQUFPO0FBQ1g7QUFFQSxJQUFNLGlCQUFpQixDQUFDLE1BQU0sY0FBYztBQUV4QyxNQUFJLFVBQVU7QUFDZCxNQUFJLFFBQVE7QUFDWixRQUFNLFdBQVc7QUFFakIsU0FBTyxXQUFXLFFBQVEsVUFBVTtBQUNoQyxRQUFJLFFBQVEsU0FBUyxvQkFDakIsUUFBUSxRQUFRLFNBQVMsc0JBQ3pCLFFBQVEsUUFBUSxVQUFVLFNBQVMsT0FBTztBQUUxQyxZQUFNLFlBQVksUUFBUSxPQUFPLFFBQVE7QUFDekMsWUFBTSxjQUFjLFFBQVEsWUFBWSxDQUFDO0FBRXpDLFVBQUksYUFBYSxhQUFhLFNBQVMsMkJBQTJCO0FBQzlELGNBQU0sWUFBWSxZQUFZLFNBQVMsQ0FBQztBQUN4QyxjQUFNLGFBQWEsWUFBWSxTQUFTLENBQUM7QUFFekMsWUFBSSxXQUFXLFNBQVMsY0FBYztBQUNsQyxnQkFBTSxVQUFVLFVBQVUsSUFBSSxTQUFTO0FBQ3ZDLGlCQUFPO0FBQUEsWUFDSDtBQUFBLFlBQ0EsYUFBYSxVQUFVO0FBQUEsWUFDdkIsWUFBWSxTQUFTO0FBQUEsWUFDckIsVUFBVSxTQUFTO0FBQUEsWUFDbkIsY0FBYyxZQUFZLFNBQVMsZUFBZSxXQUFXLE9BQU87QUFBQSxVQUN4RTtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUNBLGNBQVUsUUFBUTtBQUNsQjtBQUFBLEVBQ0o7QUFFQSxTQUFPO0FBQ1g7QUFFQSxJQUFNLGtCQUFrQixDQUFDLE1BQU0sWUFBWSxpQkFBaUI7QUFDeEQsUUFBTSxVQUFVLE1BQU07QUFDbEIsUUFBSSxLQUFLLEtBQUssU0FBUyxnQkFBaUIsUUFBTyxLQUFLLEtBQUs7QUFDekQsUUFBSSxLQUFLLEtBQUssU0FBUztBQUNuQixhQUFPLEdBQUcsS0FBSyxLQUFLLE9BQU8sSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUk7QUFDOUQsV0FBTztBQUFBLEVBQ1g7QUFFQSxRQUFNLFVBQVUsUUFBUTtBQUN4QixNQUFJLENBQUMsUUFBUyxRQUFPO0FBR3JCLE1BQUksaUJBQWlCLGNBQWMsT0FBTyxHQUFHO0FBQ3pDLFdBQU87QUFBQSxFQUNYO0FBRUEsU0FBTztBQUNYO0FBSUEsU0FBUyxnQkFBZ0IsS0FBSyxVQUFVO0FBQ3BDLE1BQUksZUFBZSxLQUFLLFFBQVEsR0FBRztBQUMvQixXQUFPLEVBQUUsTUFBTSxJQUFJO0FBQUEsRUFDdkI7QUFFQSxNQUFJO0FBQ0EsVUFBTSxNQUFNLE1BQU0sS0FBSztBQUFBLE1BQ25CLFlBQVk7QUFBQSxNQUNaLFNBQVMsQ0FBQyxPQUFPLFlBQVk7QUFBQSxJQUNqQyxDQUFDO0FBRUQsVUFBTSxLQUFLLElBQUksWUFBWSxHQUFHO0FBQzlCLFVBQU0sTUFBTSxLQUFLLFNBQVMsUUFBUSxJQUFJLEdBQUcsUUFBUTtBQUNqRCxRQUFJLFVBQVU7QUFHZCxTQUFLLEtBQUs7QUFBQSxNQUNOLE1BQU0sTUFBTSxRQUFRO0FBQ2hCLFlBQUksVUFBVSxDQUFDLE9BQU8sVUFBVSxlQUFlLEtBQUssTUFBTSxRQUFRLEdBQUc7QUFDakUsaUJBQU8sZUFBZSxNQUFNLFVBQVUsRUFBRSxPQUFPLFFBQVEsWUFBWSxNQUFNLENBQUM7QUFBQSxRQUM5RTtBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFHRCxVQUFNLFlBQVkseUJBQXlCLEdBQUc7QUFHOUMsVUFBTSxlQUFlLG9CQUFJLElBQUk7QUFDN0IsU0FBSyxLQUFLO0FBQUEsTUFDTixNQUFNLE1BQU07QUFDUixZQUFJLEtBQUssU0FBUyx1QkFDZCxLQUFLLE9BQU8sVUFBVSxjQUFjO0FBQ3BDLHFCQUFXLFFBQVEsS0FBSyxZQUFZO0FBQ2hDLHlCQUFhLElBQUksS0FBSyxNQUFNLElBQUk7QUFBQSxVQUNwQztBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSixDQUFDO0FBR0QsU0FBSyxLQUFLO0FBQUEsTUFDTixNQUFNLE1BQU07QUFDUixZQUFJLEtBQUssU0FBUyxvQkFBcUI7QUFFdkMsY0FBTSxhQUFhLGVBQWUsTUFBTSxTQUFTO0FBQ2pELGNBQU0sZUFBZSxnQkFBZ0IsTUFBTSxZQUFZLFlBQVk7QUFFbkUsWUFBSSxDQUFDLGdCQUNELENBQUMsWUFBWSxnQkFBZ0IsRUFBRSxTQUFTLFlBQVksS0FDbkQsQ0FBQyxpQkFBaUIsY0FBYyxhQUFhLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUN2RCxDQUFDLFVBQVUsWUFBWSxFQUFJO0FBRW5DLGNBQU0sRUFBRSxNQUFNLE9BQU8sSUFBSSxLQUFLLElBQUk7QUFDbEMsWUFBSSxZQUFZLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxNQUFNO0FBR3hDLFlBQUksWUFBWTtBQUNaLHVCQUFhLElBQUksV0FBVyxTQUFTO0FBQUEsUUFDekM7QUFHQSxhQUFLLFlBQVksUUFBUSxDQUFDLFNBQVM7QUFDL0IsY0FBSSxLQUFLLFNBQVMsa0JBQ2QsS0FBSyxPQUFPLFNBQVMsNEJBQ3JCLEtBQUssTUFBTSxZQUFZLFNBQVMsY0FBYztBQUM5QyxrQkFBTSxVQUFVLEtBQUssTUFBTSxXQUFXO0FBQ3RDLGtCQUFNLFVBQVUsVUFBVSxJQUFJLE9BQU87QUFFckMsZ0JBQUksU0FBUztBQUNULDJCQUFhLElBQUksT0FBTztBQUFBLFlBQzVCO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUdELFlBQUksWUFBWSxjQUFjO0FBQzFCLGFBQUcsV0FBVyxLQUFLLEtBQUssS0FBSyxvQkFBb0IsV0FBVyxZQUFZLEdBQUc7QUFBQSxRQUMvRTtBQUVBLFdBQUcsV0FBVyxLQUFLLEtBQUssS0FBSyxxQkFBcUIsU0FBUyx3QkFBd0IsWUFBWSxHQUFHO0FBQ2xHLGtCQUFVO0FBQUEsTUFDZDtBQUFBLElBQ0osQ0FBQztBQUVELFFBQUksU0FBUztBQUNULGFBQU87QUFBQSxRQUNILE1BQU0sR0FBRyxTQUFTO0FBQUEsUUFDbEIsS0FBSyxHQUFHLFlBQVksRUFBRSxPQUFPLEtBQUssQ0FBQztBQUFBLE1BQ3ZDO0FBQUEsSUFDSjtBQUVBLFdBQU8sRUFBRSxNQUFNLElBQUk7QUFBQSxFQUN2QixTQUFTLEtBQUs7QUFDVixZQUFRLE1BQU0sa0NBQWtDLEdBQUc7QUFDbkQsV0FBTyxFQUFFLE1BQU0sSUFBSTtBQUFBLEVBQ3ZCO0FBQ0o7QUFFTyxTQUFTLHdCQUF3QjtBQUNwQyxTQUFPO0FBQUEsSUFDSCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVLEtBQUssSUFBSTtBQUNmLFVBQUksR0FBRyxTQUFTLE1BQU0sS0FBSyxHQUFHLFNBQVMsTUFBTSxHQUFHO0FBQzVDLGVBQU8sZ0JBQWdCLEtBQUssRUFBRTtBQUFBLE1BQ2xDO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFDSjs7O0FENWVBLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sa0JBQWtCLE9BQU87QUFBQSxFQUM3QixNQUFNO0FBQUE7QUFBQSxFQUVOLHFCQUFxQjtBQUNuQixXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsUUFDSjtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsVUFBVTtBQUFBLFVBQ1YsVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQTBDWjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sZ0JBQWdCO0FBQUEsSUFDaEIsU0FBUyxpQkFBaUIsc0JBQXNCO0FBQUEsRUFDbEQsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLQyxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicGF0aCJdCn0K

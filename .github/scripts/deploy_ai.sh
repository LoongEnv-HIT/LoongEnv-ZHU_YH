#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

: "${PAGES_BASE_PATH:?PAGES_BASE_PATH is required}"

site_dir="$repo_root/site"
rm -rf "$site_dir"
mkdir -p "$site_dir"
echo > "$site_dir/.nojekyll"

detect_frontend_dirs() {
  find "$repo_root" -mindepth 1 -maxdepth 2 -name package.json -print0 | while IFS= read -r -d '' package_file; do
    project_dir="$(dirname "$package_file")"

    if [[ ! -f "$project_dir/index.html" ]]; then
      continue
    fi

    printf '%s\n' "$project_dir"
  done
}

{
  echo "<!doctype html>"
  echo "<html lang=\"zh-CN\">"
  echo "<head>"
  echo "  <meta charset=\"utf-8\">"
  echo "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
  echo "  <title>LoongEnv-ZHU_YH 在线预览</title>"
  echo "  <style>"
  echo "    body { font-family: system-ui, sans-serif; margin: 40px; line-height: 1.6; }"
  echo "    h1 { margin-bottom: 8px; }"
  echo "    ul { padding-left: 20px; }"
  echo "    li { margin: 10px 0; }"
  echo "    a { color: #0b57d0; text-decoration: none; }"
  echo "    a:hover { text-decoration: underline; }"
  echo "  </style>"
  echo "</head>"
  echo "<body>"
  echo "  <h1>LoongEnv-ZHU_YH 在线预览</h1>"
  echo "  <p>以下页面由 <code>DEPLOY_AI</code> 自动扫描并发布。</p>"
  echo "  <p><a href=\"https://github.com/LoongEnv-HIT/LoongEnv-ZHU_YH/actions/workflows/deploy-ai.yml\">进入 DEPLOY_AI 手动执行入口</a></p>"
  echo "  <h2>AI 入口</h2>"
  echo "  <ul>"
  echo "    <li><a href=\"https://github.com/LoongEnv-HIT/LoongEnv-ZHU_YH/actions/workflows/deploy-ai.yml\">运行 DEPLOY_AI</a></li>"
  echo "    <li><a href=\"https://github.com/LoongEnv-HIT/LoongEnv-ZHU_YH/actions\">查看 Actions 列表</a></li>"
  echo "  </ul>"
  echo "  <h2>在线预览项目</h2>"
  echo "  <ul>"
} > "$site_dir/index.html"

found_any=0
while IFS= read -r project_dir; do
  [[ -z "$project_dir" ]] && continue
  found_any=1

  project_name="$(basename "$project_dir")"
  target_dir="$site_dir/$project_name"
  mkdir -p "$target_dir"

  pushd "$project_dir" >/dev/null
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund >/dev/null
  else
    npm install --no-audit --no-fund >/dev/null
  fi

  if jq -e '.devDependencies.vite // .dependencies.vite // empty' package.json >/dev/null 2>&1; then
    npm run build -- --base "${PAGES_BASE_PATH}/${project_name}/" >/dev/null
  else
    npm run build >/dev/null
  fi

  build_dir=""
  if [[ -d dist ]]; then
    build_dir="dist"
  elif [[ -d build ]]; then
    build_dir="build"
  else
    popd >/dev/null
    continue
  fi

  cp -a "$build_dir"/. "$target_dir"/
  popd >/dev/null

  {
    echo "    <li><a href=\"./${project_name}/\">${project_name}</a></li>"
  } >> "$site_dir/index.html"
done < <(detect_frontend_dirs | sort -u)

if [[ "$found_any" -eq 0 ]]; then
  echo "    <li>当前未检测到可发布的前端项目。</li>" >> "$site_dir/index.html"
fi

{
  echo "  </ul>"
  echo "</body>"
  echo "</html>"
} >> "$site_dir/index.html"

# CLI workflow

## Bash helpers

```bash
# update dainty-shared

function uds
{
    if [[ `git status --porcelain` ]]; then
        echo "Repository \`${PWD##*/}\` has changes. Skipping."
        echo
    else
        echo "Repository \`${PWD##*/}\` is clean. Updating \`dainty-shared\`…"
        echo
        yarn add dainty-shared@latest && git add . && git commit -a -m "Update \`dainty-shared\`" && yarn link dainty-shared
    fi
}

# Update `dainty-shared` all

function udsa
{
    pwd=$PWD
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-vs
    uds
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-vscode
    uds
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-wsltty
    uds
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-site
    uds
    cd "$pwd"
}

# `git push` Dainty all

function gphda
{
    pwd=$PWD
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-shared
    echo "Pushing repository \`${PWD##*/}\`…"
    git push
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-vs
    echo "Pushing repository \`${PWD##*/}\`…"
    git push
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-vscode
    echo "Pushing repository \`${PWD##*/}\`…"
    git push
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-wsltty
    echo "Pushing repository \`${PWD##*/}\`…"
    git push
    cd /mnt/c/Users/Alexander\ Teinum/repos/dainty-site
    echo "Pushing repository \`${PWD##*/}\`…"
    git push
    cd "$pwd"
}
```

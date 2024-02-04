const fs = require('fs').promises
const matter = require('gray-matter')

// 给修改的 mdx 文件添加 updatedOn 字段
const updateFrontmatter = async () => {
  const [, , ...mdFilePaths] = process.argv

  mdFilePaths.forEach(async (path) => {
    const file = matter.read(path)
    const { data: currentFrontmatter } = file

    if (!currentFrontmatter.draft) {
      const updatedFrontmatter = {
        ...currentFrontmatter,
        updatedOn: new Date().toISOString().slice(0, 10),
      }
      file.data = updatedFrontmatter
      const updatedFileContent = matter.stringify(file)
      fs.writeFile(path, updatedFileContent)
    }
  })
}

updateFrontmatter()

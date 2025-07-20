import { FaFile, FaFolder } from 'react-icons/fa'

type FileItem = {
  name: string;
  path: string;
}

type FileSidebarProps = {
  files: FileItem[];
  selectedFile: string;
  onSelectFile: (file: string) => void;
}

export default function FileSidebar({ files, selectedFile, onSelectFile }: FileSidebarProps) {
  // Group files by directory structure
  const fileGroups: Record<string, FileItem[]> = {
    'root': files.filter(file => !file.path.includes('/')),
    'commands': files.filter(file => file.path.includes('/commands/')),
    'events': files.filter(file => file.path.includes('/events/')),
    'utils': files.filter(file => file.path.includes('/utils/')),
  }

  const getButtonClass = (isSelected: boolean) => {
    const baseClass = 'w-full text-left px-2 py-1 rounded flex items-center gap-2 text-sm transition-colors'
    return isSelected 
      ? `${baseClass} bg-discord-blurple text-white`
      : `${baseClass} hover:bg-discord-lighterBg text-gray-300`
  }

  return (
    <div className="w-full lg:w-64 bg-discord-darkBg rounded-lg p-4">
      <h3 className="font-medium mb-4 text-white">Files</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
            <FaFolder className="w-3 h-3" />
            Root
          </div>
          <ul className="space-y-1">
            {fileGroups.root.map(file => (
              <li key={file.name}>
                <button
                  className={getButtonClass(selectedFile === file.name)}
                  onClick={() => onSelectFile(file.name)}
                >
                  <FaFile className="text-gray-400 w-3 h-3" />
                  <span>{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {Object.entries(fileGroups).filter(([key]) => key !== 'root').map(([folder, folderFiles]) => (
          folderFiles.length > 0 && (
            <div key={folder}>
              <div className="text-sm text-gray-400 mb-2 capitalize flex items-center gap-2">
                <FaFolder className="w-3 h-3" />
                {folder}
              </div>
              <ul className="space-y-1">
                {folderFiles.map(file => (
                  <li key={file.name}>
                    <button
                      className={getButtonClass(selectedFile === file.name)}
                      onClick={() => onSelectFile(file.name)}
                    >
                      <FaFile className="text-gray-400 w-3 h-3" />
                      <span>{file.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

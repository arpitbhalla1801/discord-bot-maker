import { FaFile, FaFolder, FolderIcon } from 'react-icons/fa'
import classNames from 'classnames'

type FileSidebarProps = {
  files: string[];
  selectedFile: string;
  onSelectFile: (file: string) => void;
}

export default function FileSidebar({ files, selectedFile, onSelectFile }: FileSidebarProps) {
  // Group files by directory structure
  const fileGroups: Record<string, string[]> = {
    'root': files.filter(file => !file.includes('/')),
    'commands': files.filter(file => file.includes('/commands/')),
    'events': files.filter(file => file.includes('/events/')),
    'utils': files.filter(file => file.includes('/utils/')),
  }

  return (
    <div className="w-full lg:w-64 bg-discord-darkBg rounded-lg p-4">
      <h3 className="font-medium mb-4">Files</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-2">Root</div>
          <ul className="space-y-1">
            {fileGroups.root.map(file => (
              <li key={file}>
                <button
                  className={classNames(
                    'w-full text-left px-2 py-1 rounded flex items-center gap-2 text-sm',
                    {
                      'bg-discord-blurple': selectedFile === file,
                      'hover:bg-discord-lighterBg': selectedFile !== file
                    }
                  )}
                  onClick={() => onSelectFile(file)}
                >
                  <FaFile className="text-gray-400" />
                  <span>{file}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {Object.entries(fileGroups).filter(([key]) => key !== 'root').map(([folder, folderFiles]) => (
          folderFiles.length > 0 && (
            <div key={folder}>
              <div className="text-sm text-gray-400 mb-2 capitalize">{folder}</div>
              <ul className="space-y-1">
                {folderFiles.map(file => (
                  <li key={file}>
                    <button
                      className={classNames(
                        'w-full text-left px-2 py-1 rounded flex items-center gap-2 text-sm',
                        {
                          'bg-discord-blurple': selectedFile === file,
                          'hover:bg-discord-lighterBg': selectedFile !== file
                        }
                      )}
                      onClick={() => onSelectFile(file)}
                    >
                      <FaFile className="text-gray-400" />
                      <span>{file.split('/').pop()}</span>
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

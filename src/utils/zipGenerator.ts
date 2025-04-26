import JSZip from 'jszip';
import { generateBotFiles } from './codeGenerator';

export async function downloadBotFiles(botData: any) {
  // Generate all the files for the bot
  const files = generateBotFiles(botData);
  
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Add each file to the zip
  files.forEach(file => {
    // Handle nested directories
    if (file.name.includes('/')) {
      const parts = file.name.split('/');
      const fileName = parts.pop() || '';
      const folderPath = parts.join('/');
      
      // Ensure folder exists
      let folder = zip;
      parts.forEach(part => {
        folder = folder.folder(part);
      });
      
      // Add file to the correct folder
      folder.file(fileName, file.content);
    } else {
      // Add file directly to the root
      zip.file(file.name, file.content);
    }
  });
  
  // Generate the zip
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Create download link
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${botData.metadata.name.replace(/\s+/g, '-')}-bot.zip`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

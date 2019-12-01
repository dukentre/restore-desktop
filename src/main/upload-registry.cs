//бесполезный файл, edge js не может найти файлы после упаковки программы, поэтому
//актуальный cs код находиться не в этом файле
using Microsoft.Win32;
using System;
using System.IO;
using System.Text;

async (path) => { 
    RegistryKey currentUserKey = Registry.CurrentUser;
    RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\\Microsoft\\Windows\\Shell\\Bags\\1\\Desktop", true);
    
    Console.WriteLine(""+path);
    string[] fileEntries = Directory.GetFiles(""+path);
    foreach (string fileName in fileEntries)
    {
        Console.WriteLine(""+fileName);
        string[] fileNameMassive = fileName.Split('/');
        Console.WriteLine("ИМЯ: "+fileNameMassive[1].Replace("#;#", ":"));
        FileStream fstream = File.OpenRead(fileName);
        byte[] array = new byte[fstream.Length];
        fstream.Read(array, 0, array.Length);
        try
        {
            int textFromFile = int.Parse(Encoding.Default.GetString(array));
            helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), textFromFile);
        }
        catch
        {
            if(fileNameMassive[1].Replace("#;#", ":") == "GroupByKey:FMTID")
            {
                string textFromFile = Encoding.Default.GetString(array);
                helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), textFromFile);
            }
            else
            {
                helloKey.SetValue(fileNameMassive[1].Replace("#;#", ":"), array);
            }
            
        }
        
        
        Console.WriteLine(fileNameMassive[1].Replace("#;#", ":"));
        fstream.Close();
    }
    helloKey.Close();
    return "success";
}
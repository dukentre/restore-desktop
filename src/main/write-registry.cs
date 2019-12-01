//бесполезный файл, edge js не может найти файлы после упаковки программы, поэтому
//актуальный cs код находиться не в этом файле
using Microsoft.Win32;
using System;
using System.IO;
using System.Text;

async (path) => { 
    System.Console.WriteLine("save desktop registy!");
    RegistryKey currentUserKey = Registry.CurrentUser;
    RegistryKey helloKey = currentUserKey.OpenSubKey(@"Software\Microsoft\Windows\Shell\Bags\1\Desktop", true);
    

    foreach (string lol in helloKey.GetValueNames())
    {
        try
        {
            StreamWriter sw = File.CreateText(path + lol.Replace(":","#;#"));
            
            if (helloKey.GetValue(lol).GetType() == typeof(Byte[]))
            {
                sw.Close();
                
                Byte[] dukentre = (byte[])helloKey.GetValue(lol);
                File.WriteAllBytes(path+ lol.Replace(":", "#;#"), dukentre);
            }
            else
            {
                var dukentre = helloKey.GetValue(lol);
                sw.Write(dukentre);
            }
            
            
            sw.Close();
        }
        catch
        {
            
        }
    }   
        
        
        
    
    helloKey.Close();
    Console.WriteLine("Save success!");
    return "success";
}
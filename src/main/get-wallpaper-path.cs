//бесполезный файл, edge js не может найти файлы после упаковки программы, поэтому
//актуальный cs код находиться не в этом файле
using Microsoft.Win32;
using System;
using System.IO;
using System.Text;
async(needToCompile) =>{
    RegistryKey currentUserKey = Registry.CurrentUser;
    RegistryKey helloKey = currentUserKey.OpenSubKey(@"Control Panel\Desktop", true);
    string path = helloKey.GetValue("Wallpaper").ToString();
    helloKey.Close();
    return path;
}
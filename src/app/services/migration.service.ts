import { Injectable } from '@angular/core';
import { deleteObject,getDownloadURL,getStorage,ref,Storage,uploadBytes  } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import Compressor from 'compressorjs';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  sistema = environment.firebaseUrl;

  constructor
  (
    private storage: Storage
  )
  {

  }

  
  // ======================================= UPLOAD FIREBASE FUNCTIONS =======================================
 
  async uploadImage(file: File, path: string): Promise<string> {
    console.log('File', file);
    
    // this.storage = getStorage();
    const storageRef = ref(this.storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadUrl = await  getDownloadURL(uploadTask.ref);
    console.log('Se subió', downloadUrl);
    
    return  this.obtenerRutaArchivoFirebaseStorage(downloadUrl) 
   }
 
 
   // ======================================= DELETED FIREBASE FUNCTIONS =======================================
 
   async deleteImage(name:string){
    // const imageRef = this.afStorage.ref(name);
    const storage = getStorage();
    const nuevaCadena = name.replace('%2F', '/');
    console.log('nueva cadena ', nuevaCadena);
    
    const desertRef = ref(this.storage, this.sistema+nuevaCadena);
    // Delete the file
   await deleteObject(desertRef).then(() => {
      console.log('elimando');
      
      // File deleted successfully
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
  }
    async deleteImageFire(name:string){
     // const imageRef = this.afStorage.ref(name);
     const storage = getStorage();
     const nuevaCadena = name.replace('%2F', '/');
     const desertRef = ref(storage, nuevaCadena);
     // Delete the file
    await deleteObject(desertRef).then(() => {
       console.log('elimando');
 
       
       // File deleted successfully
     }).catch((error) => {
       // Uh-oh, an error occurred!
     });
   }

   obtenerRutaArchivoFirebaseStorage(url: string): string {
    const regex = /\/b\/(.*?)\/o\/(.*?)\?alt=media/;
    const match = url.match(regex);
    if (match && match.length === 3) {
      return match[2];
    } else {
      throw new Error("La URL no es válida para Firebase Storage");
    }
  }


  async compressFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.5,
        success(result:any) {
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });
  }
}

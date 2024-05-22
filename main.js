// Evento que se activa cuando se selecciona una imagen
document.getElementById('imageUpload').addEventListener('change', async (event) => {
    const file = event.target.files[0]; // Obtener el archivo de imagen seleccionado
    const img = document.getElementById('originalImage');
    if (file){
        img.src = URL.createObjectURL(file); // Mostrar la imagen en el elemento img
    } else {
        img.src = ''; // Limpiar la imagen si no se selecciona un archivo
    }

    img.onload = async () => {
        // Convertir la imagen a un tensor de TensorFlow.js
        const tensor = tf.browser.fromPixels(img);

        // Recortar la imagen al centro de un tamaño 200x200 píxeles
        const [height, width] = tensor.shape;
        const targetSize = 200; // Tamaño deseado
        const offsetY = Math.max(0, (height - targetSize) / 2); // Calcular el desplazamiento en Y
        const offsetX = Math.max(0, (width - targetSize) / 2); // Calcular el desplazamiento en X
        const croppedTensor = tensor.slice([offsetY, offsetX, 0], [targetSize, targetSize, 3]); // Recortar la imagen
        await tf.browser.toPixels(croppedTensor, document.getElementById('croppedCanvas')); 

        // Redimensionar la imagen a 100x100 píxeles usando Vecino Más Cercano
        const resizedNearestTensor = tf.image.resizeNearestNeighbor(tensor, [100, 100]);
        await tf.browser.toPixels(resizedNearestTensor, document.getElementById('resizedNearestCanvas'));

        // Redimensionar la imagen a 100x100 píxeles usando Bilineal
        const resizedBilinear = tf.image.resizeBilinear(tensor, [100, 100]);
        const resizedBilinearNormalized = resizedBilinear.div(tf.scalar(255)); // Normalizar los valores de píxeles
        await tf.browser.toPixels(resizedBilinearNormalized, document.getElementById('resizedBilinearCanvas'));

        // Espejar la imagen horizontalmente
        const mirrored = tensor.reverse(1); // Espejar horizontalmente
        tf.browser.toPixels(mirrored, document.getElementById('flippedCanvas'));

        // Liberar memoria eliminando los tensores
        tensor.dispose();
        resizedBilinear.dispose();
        resizedNearestTensor.dispose();
        mirrored.dispose();
    };
});
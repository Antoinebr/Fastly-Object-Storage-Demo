/**
 * 
 *  Settings Form 
 * 
 */
const $settingsForm = document.getElementById('settingsForm');

if ($settingsForm) {

    document.getElementById('settingsForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting

        // Get form values
        const region = document.getElementById('region').value;
        const accessKeyId = document.getElementById('accessKeyId').value;
        const secretKey = document.getElementById('secretKey').value;

        // Save to localStorage
        localStorage.setItem('region', region);
        localStorage.setItem('accessKeyId', accessKeyId);
        localStorage.setItem('secretKey', secretKey);

        // Save to Cookies (expires in 7 days)
        document.cookie = `region=${region}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `accessKeyId=${accessKeyId}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `secretKey=${secretKey}; path=/; max-age=${7 * 24 * 60 * 60}`;

        alert('Parameters saved to localStorage!');
    });

    // Load saved values from localStorage (if they exist)
    document.addEventListener('DOMContentLoaded', function() {
        const savedRegion = localStorage.getItem('region');
        const savedAccessKeyId = localStorage.getItem('accessKeyId');
        const savedSecretKey = localStorage.getItem('secretKey');

        if (savedRegion) document.getElementById('region').value = savedRegion;
        if (savedAccessKeyId) document.getElementById('accessKeyId').value = savedAccessKeyId;
        if (savedSecretKey) document.getElementById('secretKey').value = savedSecretKey;
    });

}




/**
 * 
 *  bucketList 
 * 
 */
async function fetchBuckets() {
    // Retrieve credentials from localStorage
    const savedRegion = localStorage.getItem('region');
    const savedAccessKeyId = localStorage.getItem('accessKeyId');
    const savedSecretKey = localStorage.getItem('secretKey');

    // Validate credentials
    if (!savedRegion || !savedAccessKeyId || !savedSecretKey) {
        alert('Missing required credentials in localStorage. Please set region, accessKeyId, and secretKey.');
        return;
    }

    try {
        // Send a GET request to fetch the bucket list
        const response = await fetch(`/s3/list-buckets?region=${savedRegion}&accessKeyId=${savedAccessKeyId}&secretKey=${savedSecretKey}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to retrieve buckets.');
        }

        // Populate the table with the bucket data
        const bucketListElement = document.getElementById('bucketList');
        bucketListElement.innerHTML = ''; // Clear existing entries

        if (result.buckets && result.buckets.length > 0) {
            result.buckets.forEach(bucket => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border border-gray-300 p-2"> <a href="/bucket/${bucket.Name}" class="text-blue">${bucket.Name}</a></td>
                    <td class="border border-gray-300 p-2">${bucket.CreationDate ? new Date(bucket.CreationDate).toLocaleString() : 'N/A'}</td>
                    <td class="border border-gray-300 p-2">
                        <button class="deleteBucket  px-2 py-1 rounded border" data-bucket="${bucket.Name}">
                        🗑️ delete
                        </button>
                        <a href="/bucket/${bucket.Name}" class="border px-2 py-2 rounded">
                            <svg class="inline" width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="m213.66 66.34l-40-40A8 8 0 0 0 168 24H88a16 16 0 0 0-16 16v16H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16v-16h16a16 16 0 0 0 16-16V72a8 8 0 0 0-2.34-5.66M168 216H56V72h76.69L168 107.31zm32-32h-16v-80a8 8 0 0 0-2.34-5.66l-40-40A8 8 0 0 0 136 56H88V40h76.69L200 75.31Zm-56-32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8m0 32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h48a8 8 0 0 1 8 8"/></svg>
                            View files
                        </a>
                    </td>
                `;
                bucketListElement.appendChild(row);
            });

            // Attach event listeners to delete buttons
            document.querySelectorAll('.deleteBucket').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const bucketName = event.target.getAttribute('data-bucket');
                    console.log(bucketName);
                    await deleteBucket(bucketName);
                });
            });

        } else {
            bucketListElement.innerHTML = '<tr><td colspan="3" class="p-2 text-center">No buckets found.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching buckets:', error);
        alert('An error occurred while fetching the bucket list.');
    }
}

async function deleteBucket(bucketName) {
    if (!confirm(`Are you sure you want to delete bucket "${bucketName}"? This action cannot be undone.`)) {
        return;
    }

    // Retrieve credentials from localStorage
    const savedRegion = localStorage.getItem('region');
    const savedAccessKeyId = localStorage.getItem('accessKeyId');
    const savedSecretKey = localStorage.getItem('secretKey');

    try {
        const response = await fetch('/s3/delete-bucket', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bucketName,
                region: savedRegion,
                accessKeyId: savedAccessKeyId,
                secretKey: savedSecretKey
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            await fetchBuckets(); // Refresh the bucket list after deletion
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error deleting bucket:', error);
        alert('An error occurred while deleting the bucket.');
    }
}


const $bucketList = document.getElementById('bucketList');
if ($bucketList) {

    // Fetch buckets when the page loads
    document.addEventListener('DOMContentLoaded', fetchBuckets);

    // Refresh bucket list on button click
    document.getElementById('refreshBuckets').addEventListener('click', fetchBuckets);

}



const $createBucketForm = document.getElementById('createBucketForm');

if ($createBucketForm) {


    document.getElementById('createBucketForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        // Get the bucket name from the form input
        const bucketName = document.getElementById('bucketName').value.toLowerCase();

        // Retrieve data from localStorage
        const savedRegion = localStorage.getItem('region');
        const savedAccessKeyId = localStorage.getItem('accessKeyId');
        const savedSecretKey = localStorage.getItem('secretKey');

        // Validate the bucket name and localStorage data
        if (!bucketName) {
            alert('Bucket name is required.');
            return;
        }
        if (!savedRegion || !savedAccessKeyId || !savedSecretKey) {
            alert('Missing required data in localStorage. Please ensure region, accessKeyId, and secretKey are set.');
            return;
        }

        try {
            // Send a POST request to the server
            const response = await fetch('/s3/create-bucket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bucketName,
                    region: savedRegion,
                    accessKeyId: savedAccessKeyId,
                    secretKey: savedSecretKey,
                }), // Include all required data in the request body
            });

            // Parse the JSON response
            const result = await response.json();

            // Handle the response
            if (response.ok) {
                await fetchBuckets();
                alert(result.message); // Show success message
            } else {
                alert(result.error); // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the bucket.');
        }
    });

}





const $modalOverlay = document.getElementById('modalOverlay');

if ($modalOverlay) {

    const modalOverlay = document.getElementById('modalOverlay');
    const openModal = document.getElementById('openModal');
    const closeModal = document.getElementById('closeModal');

    // Open modal on button click
    openModal.addEventListener('click', () => {
        modalOverlay.classList.remove('hidden');
    });

    // Close modal on clicking the close button or overlay
    closeModal.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) { // Close when clicking outside the modal content
            modalOverlay.classList.add('hidden');
        }
    });

}







$uploadForm = document.getElementById('uploadForm');

if ($uploadForm) {


    // Extract bucket name from URL
    const pathParts = window.location.pathname.split('/');
    const bucketName = pathParts[pathParts.length - 1]; // Get the last part of the URL
    document.querySelector('.bucketName').innerText = bucketName;

    // Handle form submission
    document.getElementById('uploadForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent form from reloading page

        const fileInput = document.getElementById('fileInput');
        if (!fileInput.files.length) {
            showMessage('Please select a file to upload.', 'bg-red-200 text-red-800');
            return;
        }

        // Retrieve credentials from localStorage
        const savedRegion = localStorage.getItem('region');
        const savedAccessKeyId = localStorage.getItem('accessKeyId');
        const savedSecretKey = localStorage.getItem('secretKey');

        if (!savedRegion || !savedAccessKeyId || !savedSecretKey) {
            showMessage('Missing credentials in localStorage. Please set region, accessKeyId, and secretKey.',
                'bg-red-200 text-red-800');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('region', savedRegion);
        formData.append('accessKeyId', savedAccessKeyId);
        formData.append('secretKey', savedSecretKey);

        try {
            const response = await fetch(`/s3/bucket/${bucketName}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'bg-green-200 text-green-800');
            } else {
                showMessage(result.error || 'Upload failed.', 'bg-red-200 text-red-800');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showMessage('An error occurred while uploading the file.', 'bg-red-200 text-red-800');
        }
    });

}
// Function to show messages
function showMessage(message, className) {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerText = message;
    messageBox.className = `mt-4 p-2 text-center rounded ${className}`;
    messageBox.classList.remove('hidden');
}



// Function to get bucket name from URL
function getBucketNameFromURL() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Last part of the URL
}

async function fetchBucketFiles() {
    const bucketName = getBucketNameFromURL();
    document.getElementById('bucketName').textContent = bucketName;

    // Retrieve credentials from localStorage
    const savedRegion = localStorage.getItem('region');
    const savedAccessKeyId = localStorage.getItem('accessKeyId');
    const savedSecretKey = localStorage.getItem('secretKey');

    if (!savedRegion || !savedAccessKeyId || !savedSecretKey) {
        alert('Missing required credentials in localStorage.');
        return;
    }

    try {
        // Fetch file list from the server
        const response = await fetch(
            `/s3/bucket/${bucketName}?region=${savedRegion}&accessKeyId=${savedAccessKeyId}&secretKey=${savedSecretKey}`
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to retrieve files.');
        }

        // Populate the table
        const fileListElement = document.getElementById('fileList');
        fileListElement.innerHTML = ''; // Clear existing entries

        if (result.files.length > 0) {
            result.files.forEach(file => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border border-gray-300 p-2"> <a href="/s3/bucket/${bucketName}/${file.Key}">${file.Key}</a></td>
                    <td class="border border-gray-300 p-2">${file.LastModified ? new Date(file.LastModified).toLocaleString() : 'N/A'}</td>
                    <td class="border border-gray-300 p-2 text-center">${file.Size}</td>
                    <td class="border border-gray-300 p-2 text-center">
                        <a href="/s3/bucket/${bucketName}/${file.Key}" target="_blank">
                            <svg class="inline" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M14 11a3 3 0 0 1-3-3V4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-8zm-2-3a2 2 0 0 0 2 2h3.59L12 4.41zM7 3h5l7 7v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3"/></svg>
                            view file
                        </a>
                    </td>
                    `;
                fileListElement.appendChild(row);
            });
        } else {
            fileListElement.innerHTML = '<tr><td colspan="3" class="p-2 text-center">No files found.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching files:', error);
        alert('An error occurred while fetching the file list.');
    }
}


const $fileList = document.getElementById('fileList');

if($fileList){
    // Fetch files on page load
    document.addEventListener('DOMContentLoaded', fetchBucketFiles);

    // Refresh file list on button click
    document.getElementById('refreshFiles').addEventListener('click', fetchBucketFiles);
}

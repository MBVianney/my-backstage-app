import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import FileUploaIcon from '@mui/icons-material/FileUpload';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';

export const FileUploader = (props: { importUrlPrefix: string}) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [clearBtn, setClearBtn] = useState<boolean>(true);

    const identityApi = useApi(identityApiRef);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        const { token } = await identityApi.getCredentials();
        if (!file) return;

        const formData =new FormData();
        formData.append('file', file);

        const importUrl = `${props.importUrlPrefix}/upload-zosconnect-csv`;
        try {
            const response = await fetch( importUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.ok) {
                setUploadStatus('Fichier uploadé avec succes !');
                setClearBtn(true);
            } else {
                setUploadStatus(`Echec lors de l'upload du fichier.`)
            }
            
        } catch (error) {
            setUploadStatus(`Erreur lors de l'upload du fichier: ${error}.`);
        }
    };

    const fileParam = file ? [
        {id: 1, name: `Name: ${file.name}`},
        {id: 1, name: `Type: ${file.type}`},
        {id: 1, name: `Size: ${(file.size / 1024).toPrecision(4)} Ko `},
    ]: [];

    return (
        <>
        <Button variant='contained' color='inherit'>
            <Tooltip title='Download zos csv'>
                <DriveFolderUploadIcon/>
            </Tooltip>
            <Typography>
                &nbsp; &nbsp;{' '}
                <input 
                id='file'
                accept='.csv'
                type='file'
                onChange={handleFileChange}
                />
            </Typography>
        </Button>
        {clearBtn && file && (<Box sx={{ flexGrow:1 , maxWidth: 752 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography >
                        File delete
                    </Typography>
                    <ul>
                        { fileParam.map(value => (
                            <li key={value.id} style={{ listStyleType: 'square' }}>
                                {value.name}
                            </li>
                        ))}
                    </ul>
                </Grid>
            </Grid>
        </Box>)}
        {file && (
            <>
            <Button 
              variant='contained'
              color='primary'
              sx={{ m:1, minHeight: 40 }}
              onClick={handleUpload}
              className='"submit'
            >
                <Tooltip title="Download zos csv">
                    <FileUploaIcon />
                </Tooltip>
                &nbsp; Upload CSV
            </Button>
            {uploadStatus && <p>{uploadStatus}</p>}
            <Button 
             variant='contained'
             title='ClearImport'
             color='secondary'
             onClick={()=> {
                setUploadStatus(null);
                setClearBtn(false);
             }}
            >
                Clear
            </Button>
            </>
        )}
        </>
    );
};

export default FileUploader;
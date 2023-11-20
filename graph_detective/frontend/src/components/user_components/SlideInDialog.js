import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { DropzoneComponent } from './DropzoneComponent';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const SlideInDialog = ({ open, handleClose, loadFlow }) => {
    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Load Flow"}</DialogTitle>
                <DialogContent>
                    <DropzoneComponent onUpload={loadFlow} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
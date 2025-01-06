import express, {Request, Response} from 'express';
import cors from 'cors';


const app = express();
app.use(cors({
    origin: false // This disabled CORS for all origins
}));


/*
    API Routing
 */
app.get('/api/v1/fetch-board', (req: Request, res: Response) =>{
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({size:[12, 14]}));

    // size: [width, height]
});


// host server

app.listen(3000,()=>{
   console.log("Servers running on localhost:3000");
});
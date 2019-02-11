To start execute: ```npm start```

Expected json log format:
 ```
{
  sessions: {
    [key: string]: [
      {
        tickNumber: number,
        board: string,
        pathMatrix: Array<Array<0|1>>,
        possibleTargets: Array<{points:number, element: {x, y}}>,
        selectedTarget: {x: number, y: number};
        nextPosition: {x:number, y:number} | null;
        snakeIsDead: boolean,
        enemyIsDead: boolean,
        debug: {
          [key:string]: any
        }
      }
      ]
  }
}
```

You can get current tick info by clicking on rendered board

![demonstration](https://i.ibb.co/xsMJy0G/gifff.gif)

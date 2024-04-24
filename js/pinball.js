function mainGame(){

  //Setting up variables for the game
  const canvas = document.getElementById('pinballGameCanvas');
  const restartBtn = document.getElementById('restartGameBtn');
  const logScoreBtn = document.getElementById('logScoreBtn');
  const confirmationText = document.getElementById('confirmation');
  const ctx = canvas.getContext('2d');
  let points = 0;
  let runGame = true;
  const audio = new Audio('/assets/ping-82822.mp3');

  //Style for flipper
  const template = ctx.createLinearGradient(0,100,300,0);
  template.addColorStop(0, "black");
  template.addColorStop(0.5, "orange");
  template.addColorStop(1, "blue")

  //Template for bumpers in the game.
  class Bumper {
    constructor (x,y,radius,value)
    {
      this.x = x   //X coordinate
      this.y = y   //Y coordinate
      this.radius = radius
      this.value = value   //Value of the bumper for points.
    }

    collide(pinball)
    {

      /*Calculate Collision: taking in centers of pinball and bumper to calculate distance and seeing if it's less
       than the radii of the pinball and bumper*/
      const distanceX = pinball.width - this.x;
      const distanceY = pinball.height - this.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
   
      
      //Collision detection
      if(distance <= this.radius + pinball.radius)
      {
        
        console.log("Speed of pinball" + pinball.dy)
        
        //Pinball will traverse in opposite direction.
        pinball.dy = -(pinball.dy);
        pinball.dx = -(pinball.dx);
    
        //Speed Modifier, successive hits on bumpers will increase speed.
        
        pinball.dy = pinball.dy * 1.005;
        pinball.dx = pinball.dx * 1.005;
        

        
        //Game effects: Bumper will 'glow', points based on bumper value will be added along with a sound effect.
        this.draw(10,"gold")
        points = points + this.value;
        audio.play();
      }

      //Reset 'hit' effect
      else
      {
        this.draw(0,"yellow");
      }
    }

    draw(blur,color){

      //Style of bumper
      const bumperTemplate = ctx.createRadialGradient(this.x,this.y,this.radius,this.x+20,this.y+20,this.radius+1);
      bumperTemplate.addColorStop(0,"yellow");
      bumperTemplate.addColorStop(0.2, "white");
      bumperTemplate.addColorStop(0.4, "blue");
      bumperTemplate.addColorStop(1, "orange");
      
      //Creating bumper
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius,120, Math.PI *2)
      ctx.fillStyle = bumperTemplate;
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;
      ctx.fill();
      ctx.closePath();
    }
  }

  //Template for Pinball
  class Pinball {
    constructor (){
      this.width = 100
      this.height = 0;
      this.radius = 10;

      //Change in coordinates (represents speed of pinball)
      this.dx = 3
      this.dy = 3
    }

    //Creating and styling the pinball
    draw(){
      ctx.beginPath();
      ctx.arc(this.width,this.height,this.radius,0,Math.PI*2)
      ctx.fillStyle = 'white'
      ctx.shadowBlur = 10
      ctx.shadowColor = 'gold'
      ctx.fill();
      ctx.closePath();

      //Determines the movement of the pinball
      this.width += this.dx
      this.height += this.dy
    }
  }

  //Flipper template
  class Flipper {
    constructor(){
      this.width = 150
      this.height = 5
      this.move = canvas.width - this.width; //Represents position of flipper
    }

    //Creating  and styling the flipper
    draw(){
      ctx.beginPath()
      ctx.fillStyle = template;
      ctx.shadowBlur = 10
      ctx.shadowColor = 'blue'
      ctx.fillRect(this.move,395,this.width,this.height);
      ctx.closePath();
    }
  }

  //Construction of pinball and flipper
  const flipper = new Flipper();
  const pinball = new Pinball();

  //Construction of bumpers for pinball to hit
  const topLeftBumper= new Bumper(50,20,10,10);
  const bottomLeftbumper = new Bumper(100,300,30,1);
  const topRightBumper = new Bumper(450,40,15,5);
  const bottomRightBumper = new Bumper(400,250,30,2);
  const middleBumper = new Bumper(250,100,20,3);
  
  //Setting up and displaying the score
  function setScore()
  {
    ctx.font = '14px Verdana'
    
    ctx.textAlign = 'right'
    ctx.shadowBlur = 12;
    ctx.shadowColor = "black";
    ctx.strokeText('Points: ' + points, 480, 14);
    ctx.fillStyle = "orange"
    ctx.fillText('Points: ' + points, 480, 14);
  }
  
  //Running actual game
  function draw()
  {
    if(!runGame){
      return;
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    //Drawing the objects
    pinball.draw();
    flipper.draw();
    topLeftBumper.draw(0,"yellow");
    bottomLeftbumper.draw(0,"yellow");
    topRightBumper.draw(0,"yellow");
    bottomRightBumper.draw(0,"yellow");
    middleBumper.draw(0,"yellow");


    //Style bonus: getting to certain score range will change the background
    if(points > 20)
    {
      canvas.style.backgroundBlendMode = "screen";
      if(points > 30)
      {
        canvas.style.backgroundBlendMode = "hard-light";
        if(points > 40)
        {
          canvas.style.backgroundBlendMode = "hue";
        }
      }
    }
    
    //Setting up the score.
    setScore();

    //Checking for collision amongst bumpers
    bottomRightBumper.collide(pinball);
    bottomLeftbumper.collide(pinball);
    topLeftBumper.collide(pinball);
    topRightBumper.collide(pinball);
    middleBumper.collide(pinball);
    
    /**** WALL AND FLIPPER COLLISION ****/

    //Hitting the top
    if(pinball.height + pinball.dy < 0){
      pinball.dy = -pinball.dy
    }

    //Hitting the bottom: Different scenarios possible
    if(pinball.height + pinball.dy > canvas.height){
      
      //Hitting the flipper
      if(pinball.width > flipper.move && pinball.width < flipper.move + flipper.width)
      {
        
          //Direction when hitting certain areas of the flipper: This is used to introduce variance to the game. A simple reverse will cause the game to loop.
          //Changes are done along the x-axis. The ball still has to go up, so that remains the same.
          if(pinball.width > flipper.move + 75)
          {
            pinball.dx *= 1.05;
          } 

          if(pinball.width > flipper.move + 1 && pinball.width < flipper.move + 75)
          {
            pinball.dx *= -1.05
          }

          pinball.dy = -(pinball.dy);
        
        
      }
      
      //The pinball hits the ground. Game is over.
      else{
        runGame = false;
        console.log("Game Over");
        
        ctx.font = '30px Arial'
        ctx.shadowColor = 'black'
        ctx.shadowBlur = 20
        ctx.lineWidth=10;
        ctx.textAlign = 'center';
        ctx.strokeText('Game Over!',250,30)
        ctx.textAlign = 'center';
        ctx.fillStyle = 'Orange'
        
        ctx.fillText('Game Over!', 250, 30);
        
        //Display buttons
        restartBtn.style.display = 'block';
        logScoreBtn.style.display = 'block';
        username.style.display = 'block';
        
      }
    }

    //Hitting the left
    if(pinball.width + pinball.dx < 0)
    {
      pinball.dx = -pinball.dx;
    }

    //Hitting the right
    if(pinball.width + pinball.dx > canvas.width)
    {
      pinball.dx = -pinball.dx;
    }

    requestAnimationFrame(draw)
    
  }
 
  draw();
        
  /** EVENT LISTENERS **/

  //Restart Game
  restartBtn.addEventListener('click',()=>{
    restartBtn.style.display = 'none'
    logScoreBtn.style.display = 'none'
    username.style.display = 'none'
    confirmationText.style.display = 'none'
    pinball.height = 0;
    pinball.width = 100;
    pinball.dx = 3;
    pinball.dy = 3;
    points = 0;
    runGame = true;
    draw()
    
    
  })

  //Sending score to leaderboard
  logScoreBtn.addEventListener('click', function () {
    submitScore()
  })

  const submitScore = async () => {
    let name = 'guest'
    name = username.value
    if (name == '' || name == null) {
      name = 'guest'
    }

    try {
      const response = await fetch('https://cis4250w24-05.socs.uoguelph.ca/addScore.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `name=${encodeURIComponent(name)}&score=${encodeURIComponent(points)}&game=pinball`
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      confirmationText.style.display = 'block'
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  //Player movement
  document.addEventListener('keydown', function (e){
    if (runGame && e.key === 'ArrowRight')
    {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      flipper.move += 50;
      flipper.draw();
    }

    if (runGame && e.key === 'ArrowLeft')
    {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      flipper.move -= 50;
      flipper.draw();
    }
  
  })

  //Mobile movement
  let isSliding = false;
  let startX = 0;

  document.addEventListener('touchstart', (e) => {
      isSliding = true;
      startX = e.touches[0].clientX;
  });

  document.addEventListener('touchmove', (e) => {
      if (isSliding) {
          const currentX = e.touches[0].clientX;
          const diffX = currentX - startX;
          startX = currentX;

          flipper.move += diffX;

          if (flipper.move < 0) {
              flipper.move = 0;
          } else if (flipper.move + flipper.width > canvas.width) {
              flipper.move = canvas.width - flipper.width;
          }

          // Redraw the flipper
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          flipper.draw();
      }
  });

  document.addEventListener('touchend', () => {
      isSliding = false;
  });

}


document.addEventListener('DOMContentLoaded', mainGame)
  

const got = require('got');
 

async function getTaco() {
    
    console.log('Querying TacoFancy for a Taco Recipie (https://taco-randomizer.herokuapp.com/random)');

        try {
            const response = await got('https://taco-randomizer.herokuapp.com/random');
           
            const taco = JSON.parse(response.body);
           
            console.log("Recipie Name: " + taco.base_layer.name);
            
        } catch (error) {
            console.log(error.response.body);
            
        }
    
}


getTaco();

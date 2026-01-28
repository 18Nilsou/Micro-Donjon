const LogPublisher = require('./logPublisher');

async function testLogService() {
  console.log('Test du Log Service...');
  
  const publisher = new LogPublisher('amqp://rabbitmq:5672');
  
  try {
    await publisher.connect();
    console.log('Connexion RabbitMQ établie');
    
    console.log('Envoi de logs de test...');
    
    // Log de création de héros
    await publisher.logHeroEvent('HERO_CREATED', {
      heroId: 'hero123',
      heroName: 'Aragorn',
      heroClass: 'Ranger',
      level: 1
    }, 'user123', 'session456');
    
    // Log de combat
    await publisher.logGameEvent('COMBAT_STARTED', {
      heroId: 'hero123',
      mobId: 'mob789',
      dungeonId: 'dungeon001',
      floor: 3
    }, 'user123', 'session456');
    
    // Log d'item trouvé
    await publisher.logItemEvent('ITEM_FOUND', {
      itemId: 'sword001',
      itemName: 'Épée magique',
      heroId: 'hero123',
      rarity: 'rare'
    }, 'user123', 'session456');
    
    // Log d'erreur
    await publisher.logError('HERO', new Error('Test error'), {
      endpoint: '/heroes/123',
      method: 'GET'
    }, 'user123', 'session456');
    
    console.log('Logs de test envoyés avec succès');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Vérifiez les logs en visitant:');
    console.log('   - http://localhost:3005/logs');
    console.log('   - http://localhost:3005/logs/stats');
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    await publisher.close();
    console.log('Connexion fermée');
  }
}

if (require.main === module) {
  testLogService().catch(console.error);
}

module.exports = testLogService;
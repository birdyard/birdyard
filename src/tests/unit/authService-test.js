'use strict'

describe('birdyard.users', function () {

  var _$rootScope;
  var _service;
    
  function init() {
    MockFirebase.override();
    module('birdyard');
    module('birdyard.users');
  }
  
  function inject() {
    return angular.mock.inject(function($rootScope, authService) {
      _$rootScope = $rootScope;
      _service = authService;
    });    
  }
  
  beforeEach(init);
  beforeEach(inject);
    
  describe('Auth service', function () {
    
    var _fakeUser = {
      uid: 'abc123',
      expires: 99999999999999,
      provider: 'twitter',
      twitter: {
        cachedUserProfile: {
          lang: 'en'
        },
        username: 'twitter_guy',
        displayName: 'Twitter Guy',
        profileImageURL: 'http://cdn.junk.com/avatar.png'
      }
    };
                
    // Signin
    
    it('should return $firebaseAuth instance', function () {
      inject(function ($Auth, $firebaseAuth) {
        var $ref = new MockFirebase();
        var $auth = $firebaseAuth($ref); 
        expect($Auth.prototype === $auth.prototype).toBeTruthy();
      });
    });
    
    it('should define signIn method.', function () {
      expect(_service.signIn).toBeDefined();
    });
    
    // it('should sign in a new user.', function () {
    //   _service.signIn(_fakeUser).then(function (result) {
    //     expect(result).toBeDefined();
    //   });
    // });
    
    // Avatar
    
    // it('should return an empty avatar url string, if user is not logged-in.', function (done) {
    //   _service.getAvatar().then(function (avatarUrl) {
    //     expect(avatarUrl).toBe(foo);
    //     done();
    //   });
    // });
  });
});
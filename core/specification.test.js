const { extractSpecPoints } = require('./specification');

const textileTop = `---
title: Features spec
section: client-lib-development-guide
index: 1
anchor_specs: true
languages:
  - none
jump_to:
  General:
    - Test guidelines
  REST client library:
    - RestClient
    - Auth#rest-auth
    - Channels#rest-channels
    - RestChannel#rest-channel
    - Plugins#plugins
    - RestPresence#rest-presence
    - Encryption#rest-encryption
    - Forwards compatibility#rest-compatibility
    - Batch Operations#batch-operations
  Realtime client library:
    - RealtimeClient
    - Connection#realtime-connection
    - Channels#realtime-channels
    - RealtimeChannel#realtime-channel
    - RealtimePresence#realtime-presence
    - EventEmitter#eventemitter
    - Forwards compatibility#realtime-compatibility
    - State conditions and operations#state-conditions-and-operations
  Push notifications:
    - Push notifications#push-notifications
    - Push channels#push-channels
    - Activation state machine#activation-state-machine
  Types:
    - Data types#types
    - Options#options
    - Push notifications#types-push
    - Client library introspection#introspection
  Interface Definition:
    - Complete API IDL#idl
  Previous version:
    - Old specs
---

This document outlines the complete feature set of both the REST and Realtime client libraries. It is expected that every client library developer refers to this document to ensure that their client library provides the same API and features as the existing Ably client libraries. In addition to this, it is essential that there is test coverage over all of the features described below. As an example, see the Ruby library "test specification and coverage":https://github.com/ably/ably-ruby/blob/main/SPEC.md generated from the test suite.

We recommend you use the "IDL (Interface Definition Language)":#idl and refer to other existing libraries that adhere to this spec as a reference when reviewing how the API has been implemented.

The key words "must", "must not", "required", "shall", "shall not", "should", "should not", "recommended",  "may", and "optional" (whether lowercased or uppercased) in this document are to be interpreted as described in "RFC 2119":https://tools.ietf.org/html/rfc2119 .

__Please note we maintain a separate Google Sheet that keeps track of which features are implemented and matching test coverage for each client library. If you intend to work on an Ably client library, please "contact us":https://ably.com/contact for access to this Google Sheet as it is useful as a reference and also needs to be kept up to date__

h2(#versions). Specification and Protocol Versions

* @(CSV1)@ **Specification Version**: This document defines the Ably client library features specification ('features spec').
** @(CSV1a)@ The specification version is a SemVer value (from specification version @2.0.0@ onwards).
** @(CSV1b)@ This document defines specification version @{{ SPECIFICATION_VERSION }}@.
* @(CSV2)@ **Protocol Version**: This document describes requirements for client libraries that are compatible with Ably endpoints at a specific protocol version (also referred to as the 'wire protocol' version).
** @(CSV2a)@ The protocol version is an Integer value (from protocol version @2@ onwards - it was a Decimal prior to that, for example @1.2@).
** @(CSV2b)@ This document is compatible with protocol version @{{ PROTOCOL_VERSION }}@.
** @(CSV2c)@ A client library must identify to Ably the protocol version it uses in all requests and connections, per "@RSC7a@":#RSC7a and "@RTN2f@":#RTN2f.
** @(CSV2d)@ It is expected, very likely required, that client libraries which implement most or all of this specification at the version defined in this document ("@CSV1b@":CSV1b) will need to identify with Ably at the protocol version defined in this document ("@CSV2b@":#CSV2b). There may, from time to time, be edge cases where this is not the case but these must be considered very carefully (for example a client library using an older protocol version until fully implemented).
** @(CSV2e)@ Client libraries that need to send a Decimal protocol version must send the exact string specified in "@CSV2b@":#CSV2b (previously @G4@). Therefore, it is recommended that client library implementations treat the version opaquely, as a string, not a float.

h2(#test-guidelines). Test guidelines

* @(G1)@ Every test should be executed using all supported protocols (i.e. JSON and "MessagePack":https://msgpack.org/ if supported).  This includes both sending & receiving data
* @(G2)@ All tests by default are run against a special Ably sandbox environment.  This environment allows apps to be provisioned without any authentication that can then be used for client library testing. Bear in mind that all apps created in the sandbox environment are automatically deleted after 60 minutes and have low limits to prevent abuse. Apps are configured by sending a @POST@ request to @https://sandbox-rest.ably.io/apps@ with a JSON body that specifies the keys and their associated capabilities, channel namespace rules and any presence fixture data that is required; see "ably-common test-app-setup.json":https://github.com/ably/ably-common/blob/main/test-resources/test-app-setup.json. Presence fixture data is necessary for the REST library presence tests as there is no way to register presence on a channel in the REST library
* @(G3)@ Testing statistics can be tricky due to timing issues and slow test suites as a result of sending requests to generate statistics.  As such, we provide a special stats endpoint in our sandbox environment that allows stats to be injected into our metrics system so that stats tests can make predictable assertions.  To create stats you must send an authenticated @POST@ request to the stats JSON to @https://sandbox-rest.ably.io/stats@ with the stats data you wish to create. See the "JavaScript stats fixture":https://github.com/ably/ably-js/blob/4e65d4e13eb8750a375b9511e4dd059092c0e481/spec/rest/stats.test.js#L8-L51 and "setup helper":https://github.com/ably/ably-js/blob/4e65d4e13eb8750a375b9511e4dd059092c0e481/spec/common/modules/testapp_manager.js#L158-L182 as an example
* @(G4)@ This clause has been replaced by "@CSV1@":#CSV1 and "@CSV2@":#CSV2. It was valid up to and including specification version 1.2.
** @(G4a)@ This clause has been replaced by "@CSV2d@":#CSV2d. It was valid up to and including specification version 1.2.

h2(#rest). REST client library

h3(#restclient). RestClient

* @(RSC1)@ The constructor accepts a set of "@ClientOptions@":#options or, in languages that support overloaded constructors, a string which may be a token string or an API key.
** @(RSC1a)@ If a single string argument is supplied when constructing the library then the library must determine whether this is a key or a token by checking for the presence of the ':' (colon) delimiter present in an API key. Any other string must be treated as a token string.
** @(RSC1b)@ If invalid arguments are provided such as no API key, no token and no means to create a token, then this will result in an error with error code 40106 and an informative message.
** @(RSC1c)@ Tests must exist that in each overloaded library constructor the library correctly determines an API key to be a key, and each type of token string is determined to be a token.
* @(RSC2)@ The logger by default outputs to @STDOUT@ (or other logging medium as appropriate to the platform) and the log level is set to warning
* @(RSC3)@ The log level can be changed
* @(RSC4)@ A custom logger can be provided in the constructor
* @(RSC5)@ @RestClient#auth@ attribute provides access to the @Auth@ object that was instantiated with the @ClientOptions@ provided in the @RestClient@ constructor
* @(RSC6)@ @RestClient#stats@ function:
** @(RSC6a)@ Returns a @PaginatedResult@ page containing @Stats@ objects in the @PaginatedResult#items@ attribute returned from the stats request
** @(RSC6b)@ Supports the following params:
*** @(RSC6b1)@ @start@ and @end@ are optional timestamp fields represented as milliseconds since epoch, or where suitable to the language, Date or Time objects. @start@, if provided, must be equal to or less than @end@ if provided or to the current time otherwise, and is unaffected by the request direction
*** @(RSC6b2)@ @direction@ backwards or forwards; if omitted the direction defaults to the REST API default (backwards)
*** @(RSC6b3)@ @limit@ supports up to 1,000 items; if omitted the limit defaults to the REST API default (100)
*** @(RSC6b4)@ @unit@ is the period for which the stats will be aggregated by, values supported are @minute@, @hour@, @day@ or @month@; if omitted the unit defaults to the REST API default (@minute@)
`;

const textileBottom = `h3(#introspection). Client library introspection

h4. ClientInformation
* @(CR1)@ Provides information about the client library and the environment in which it’s running.
* @(CR2)@ @agents@ static property:
** @(CR2a)@ Returns a @Dict<String, String?>@ that lists the default key-value entries that the library uses to populate the @Agent@ library identifier, as described by "@RSC7d1@":#RSC7d1. An example would be @{ "ably-java": "1.2.1", "android": "24" }@.
* @(CR3)@ @agentIdentifier@ static method:
** @(CR3a)@ The client library must only offer this method if it offers the @ClientOptions#agents@ property described by "@RSC7d6@":#RSC7d6.
** @(CR3b)@ Returns the @Agent@ library identifier described by "@RSC7d@":#RSC7d.
** @(CR3c)@ Accepts an @additionalAgents@ parameter of type @Dict<String, String?>?@, whose value is to be interpreted with the same semantics as the @ClientOptions#agents@ property. The @agentIdentifier@ method will inject these agents into the @Agent@ library identifier that it returns.
** @(CR3d)@ An API commentary must be provided for this method. This commentary must make it clear that this interface is only to be used by Ably-authored SDKs.

h3(#defaults). Client Library defaults

The following default values are configured for the client library:

* @(DF1)@ Realtime defaults:
** @(DF1a)@ @connectionStateTtl@ integer - default 120s. The duration that Ably will persist the connection state when a Realtime client is abruptly disconnected. When the client is in the @DISCONNECTED@ state, once this TTL has passed, the client should transition the state to the @SUSPENDED@ state signifying that the state is now lost i.e. channels need to be re-attached manually. Note that this default is overriden by @connectionStateTtl@, if specified in the @ConnectionDetails@ of the @CONNECTED@ @ProtocolMessage@
** @(DF1b)@ This clause has been replaced by "TO3l11":#TO3l11.

h2(#idl). Interface Definition

The following bespoke IDL (Interface Definition Language) describes the types and classes present in the REST and Realtime client libraries.

Please note the following conventions:

* Types are capitalized
* Attribute and method names are lowercase
* Attributes are denoted as @attributeName: Type@
* Instance methods are denoted as @methodName(argName: Type, argName: Type) -> ReturnType@ (@ReturnType@ may be omitted)
* Callback functions / closures are denoted as @(argName: Type, argName: Type) -> ReturnType@ (@ReturnType@ is usually omitted)
* Values produced by I/O (e.g. a request) are prefixed with @=> io@. In some platforms (JS) those values are passed as arguments to a callback argument, instead of being returned. I/O always can fail, but how do they fail is undefined in the spec, so it's also undefined here
* Enums are denoted as @.A | .B | .C@
* @Type?@ denotes a nullable type
* @[Type: Othertype]@ denotes a map, hash or equivalent, or (if idiomatic) a list of 2-tuples.
* @Type default value@ denotes that the thing being annotated with @Type@ has @value@ as default. @Type api-default value@ denotes that the Ably server API uses those defaults and therefore it is unnecessary for the client library to send these default values to the API
* Class fields (as opposed to instance fields) are prefixed with a @+@
* @Duration@ and @Time@ types are typically represented as milliseconds since the epoch. Where needed, a more idiomatic language specific duration may be used such as @seconds@ or @Time@ respectively for Ruby
* @Data@ is a message payload type, see "RSL4a":#RSL4a for a list of supported payload types
* @Stringifiable@ is a type used for unknown configuration parameters that need to be coerced to strings when used, see "RTC1f":#RTC1f for definition
* @JSONObject@ and @JSONArray@ denote any type or interface in the target language that represents an "RFC4627":https://www.ietf.org/rfc/rfc4627.txt @object@ or @array@ value respectively. Such types serialize to, and may be deserialized from, the corresponding JSON text. In the specification text above, values of these types are collectively referred to as "JSON-encodable".

Each type, method, and attribute is labelled with the name of one or more clauses from the preceding feature spec. An asterisk is used as a wildcard to mean all clauses with a given prefix.

<pre>
class RestClient: // RSC*
  constructor(keyOrTokenStr: String) // RSC1
  constructor(ClientOptions) // RSC1
  auth: Auth // RSC5
  push: Push // RSC21
  batch: BatchOperations // BO1
  device() => io LocalDevice // RSH8
  channels: Channels<RestChannel> // RSN1
  request(
    String method,
    String path,
    Dict<String, String> params?,
    JsonObject | JsonArray body?,
    Dict<String, String> headers?
  ) => io HttpPaginatedResponse // RSC19
  stats(
    start: Time api-default epoch(), // RSC6b1
    end: Time api-default now(), // RSC6b1
    direction: .Backwards | .Forwards api-default .Backwards, // RSC6b2
    limit: int api-default 100, // RSC6b3
    unit: .Minute | .Hour | .Day | .Month api-default .Minute // RSC6b4
  ) => io PaginatedResult<Stats> // RSC6a
  time() => io Time // RSC16

class RealtimeClient: // RTC*
  constructor(keyOrTokenStr: String) // RTC12
  constructor(ClientOptions) // RTC12
  auth: Auth // RTC4
  push: Push // RTC13
  batch: BatchOperations // BO1
  device() => io LocalDevice // RSH8
  channels: Channels<RealtimeChannel> // RTC3, RTS1
  clientId: String? // RTC17
  connection: Connection // RTC2
  request(
    String method,
    String path,
    Dict<String, String> params?,
    JsonObject | JsonArray body?,
    Dict<String, String> headers?
  ) => io HttpPaginatedResponse // RTC9
  stats(
    start: Time api-default epoch(),
    end: Time api-default now(),
    direction: .Backwards | .Forwards api-default .Backwards,
    limit: int api-default 100,
    unit: .Minute | .Hour | .Day | .Month api-default .Minute
  ) => io PaginatedResult<Stats> // Same as RestClient.stats, RTC5
  close() // RTC16
  connect() // RTC15
  time() => io Time // RTC6

class ClientOptions: // TO*
  embeds AuthOptions // This is not currently documented in the spec and needs to be – see https://github.com/ably/docs/issues/1476
  autoConnect: Bool default true // RTC1b, TO3e
  clientId: String? // RSC17, RSA15, TO3a
  defaultTokenParams: TokenParams? // TO3j11
  echoMessages: Bool default true // RTC1a, TO3h
  environment: String? // RSC15e, TO3k1
  logHandler: // platform specific - TO3c
  logLevel: // platform specific - TO3b
  logExceptionReportingUrl: String default "[library specific]" // TO3m (deprecated)
  port: Int default 80 // TO3k4
  queueMessages: Bool default true // RTP16b, TO3g
  restHost: String default "rest.ably.io" // RSC12, TO3k2
  realtimeHost: String default "realtime.ably.io" // RTC1d, TO3k3
  fallbackHosts: String[] default nil // RSC15b, RSC15a, TO3k6
  fallbackHostsUseDefault: Bool default false // TO3k7 (deprecated)
  recover: String? // RTC1c, TO3i
  tls: Bool default true // RSC18, TO3d
  tlsPort: Int default 443 // TO3k5
  useBinaryProtocol: Bool default true // TO3f
  transportParams: [String: Stringifiable]? // TO3q, RTC1f
  addRequestIds: Bool default false // TO3p
  // configurable retry and failure defaults
  disconnectedRetryTimeout: Duration default 15s // TO3l1
  suspendedRetryTimeout: Duration default 30s // RTN14e, TO3l2
  channelRetryTimeout: Duration default 15s // RTL13b, TO3l7
  httpOpenTimeout: Duration default 4s // TO3l3
  httpRequestTimeout: Duration default 10s // TO3l4
  realtimeRequestTimeout: Duration default 10s // TO3l11
  httpMaxRetryCount: Int default 3 // TO3l5
  httpMaxRetryDuration: Duration default 15s // TO3l6
  maxMessageSize: Int default 65536 // TO3l8
  maxFrameSize: Int default 524288 // TO3l9
  fallbackRetryTimeout: Duration default 600s // TO3l10
  plugins: Dict<PluginType, Plugin> // TO3o
  idempotentRestPublishing: bool default true // RSL1k1, RTL6a1, TO3n
  agents: [String: String?]? // RSC7d6 - interface only offered by some libraries

class AuthOptions: // AO*
  authCallback: ((TokenParams) -> io (String | TokenDetails | TokenRequest | JsonObject))? // RSA4a, RSA4, TO3j5, AO2b
  authHeaders: [String: Stringifiable]? // RSA8c3, TO3j8, AO2e
  authMethod: .GET | .POST default .GET // RSA8c, TO3j7, AO2d
  authParams: [String: Stringifiable]? // RSA8c3, RSA8c1, TO3j9, AO2f
  authUrl: String? // RSA4a, RSA4, RSA8c, TO3j6, AO2c
  key: String? // RSA11, RSA14, TO3j1, AO2a
  queryTime: Bool default false // RSA9d, TO3j10, AO2g
  token: String? | TokenDetails? | TokenRequest? // RSA4a, RSA4, TO3j2, AO2h
  tokenDetails: TokenDetails? // RSA4a, RSA4, TO3j3, AO2i
  useTokenAuth: Bool? // RSA4, RSA14, TO3j4, AO2j

class TokenParams: // TK*
  capability: String api-default '{"*":["*"]}' // RSA9f, TK2b
  clientId: String? // TK2c
  nonce: String? // RSA9c, Tk2e
  timestamp: Time? // RSA9d, TK2d
  ttl: Duration api-default 60min // RSA9e, TK2a

class Auth: // RSA*
  clientId: String? // RSA7, RSC17, RSA12
  authorize(TokenParams?, AuthOptions?) => io TokenDetails // RSA10
  createTokenRequest(TokenParams?, AuthOptions?) => io TokenRequest // RSA9
  requestToken(TokenParams?, AuthOptions?) => io TokenDetails // RSA8
  tokenDetails: TokenDetails? // RSA16

class TokenDetails: // TD*
  +fromJson(String | JsonObject) -> TokenDetails // TD7
  capability: String // TD5
  clientId: String? // TD6
  expires: Time // TD3
  issued: Time // TD4
  token: String // TD2

class TokenRequest: // TE*
  +fromJson(String | JsonObject) -> TokenRequest // TE6
  capability: String // TE3
  clientId: String? // TE2
  keyName: String // TE2
  mac: String // TE2
  nonce: String // TE2
  timestamp: Time? // TE5
  ttl: Duration? api-default 60min // TE4

class Channels<ChannelType>: // RSN*, RTS*
  exists(String) -> Bool // RSN2, RTS2
  get(String) -> ChannelType // RSN3, RTS3
  get(String, ChannelOptions) -> ChannelType // RSN3c, RTS3c
  iterate() -> Iterator<ChannelType> // RSN2, RTS2
  release(String) // RSN4, RTS4

class RestChannel: // RSL*
  name: String // RSL9
  presence: RestPresence // RSL3
  history(
    start: Time, // RSL2b1
    end: Time api-default now(), // RSL2b1
    direction: .Backwards | .Forwards api-default .Backwards, // RSL2b2
    limit: int api-default 100 // RSL2b3
  ) => io PaginatedResult<Message> // RSL2
  status() => ChannelDetails // RSL8
  publish(Message, params?: Dict<String, Stringifiable>) => io // RSL1
  publish([Message], params?: Dict<String, Stringifiable>) => io // RSL1
  publish(name: String?, data: Data?) => io // RSL1
  setOptions(options: ChannelOptions) => io // RSL7 - note asynchronous return value for
    // compatibility with RealtimeChannel#setOptions; not required for REST-only libraries

  // Only on platforms that support receiving push notifications:
  push: PushChannel // RSH7

class RealtimeChannel: // RTL*
  embeds EventEmitter<ChannelEvent, ChannelStateChange?> // RTL2, RTL2a, RTL2d
  name: String // RTL23
  errorReason: ErrorInfo? // RTL24
  state: ChannelState // RTL2b
  presence: RealtimePresence // RTL9
  properties: ChannelProperties // RTL15
  // Only on platforms that support receiving push notifications:
  push: PushChannel // RSH7
  modes: readonly [ChannelMode] // RTL4m
  params: readonly Dict<String, String> // RTL4k1
  attach() => io // RTL4
  detach() => io // RTL5
  history(
    start: Time, // RTL10a
    end: Time api-default now(), // RTL10a
    direction: .Backwards | .Forwards api-default .Backwards, // RTL10a
    limit: int api-default 100, // RTL10a
    untilAttach: Bool default false // RTL10b
  ) => io PaginatedResult<Message> // RTL10
  publish(Message) => io // RTL6, RTL6i
  publish([Message]) => io // RTL6, RTL6i
  publish(name: String?, data: Data?) => io // RTL6, RTL6i
  subscribe((Message) ->) => io // RTL7, RTL7a
  subscribe(String, (Message) ->) => io // RTL7, RTL7b
  subscribe(MessageFilter, (Message) ->) // RTL22
  unsubscribe() // RTL8, RTL8c
  unsubscribe((Message) ->) // RTL8, RTL8a
  unsubscribe(String, (Message) ->) // RTL8, RTL8b
  unsubscribe(MessageFilter, (Message) ->) // RTL22
  setOptions(options: ChannelOptions) => io // RTL16

class MessageFilter: // MFI*
  isRef: bool // MFI2a
  refTimeserial: string // MFI2b
  refType: string // MFI2c
  name: string // MFI2d

class ChannelProperties: // CP*
  attachSerial: String // CP2a
  channelSerial: String // CP2b

class BatchOperations: // BO*
  publish([BatchSpec]) => BatchResult<BatchPublishResponse> // BO2a
  publish(BatchSpec) => BatchResult<BatchPublishResponse> // BO2a
  getPresence([String]) => BatchResult<BatchPresenceResponse> // BO2b

class BatchResult<T>: // BPA*
  error: ErrorInfo? // BPA2b
  responses: []T? // BPA2a

class BatchPublishResponse: // BPB*
  channel: String // BPB2a
  messageId: String? // BPB2b
  error: ErrorInfo? // BPB2c

class BatchPresenceResponse: // BPD*
  channel: String // BPD2a
  presence: []BatchPresence // PBD2b

class BatchPresence: // BPE*
  clientId: string // BPE2a
  action: string? // BPE2b
  error: ErrorInfo? // BPE2c

// Only on platforms that support receiving push notifications:
class PushChannel: // RSH7
  subscribeDevice() => io // RSH7a
  subscribeClient() => io // RSH7b
  unsubscribeDevice() => io // RSH7c
  unsubscribeClient() => io // RSH7d
  listSubscriptions(params?: Dict<String, String>) => io PaginatedResult<PushChannelSubscription> // RSH7e

class BatchSpec: // BSP*
  channels: [String] // BSP2a
  messages: [Message] // BSP2b

enum ChannelState: // RTL2
  INITIALIZED
  ATTACHING
  ATTACHED
  DETACHING
  DETACHED
  SUSPENDED
  FAILED

enum ChannelEvent: // RTL2
  embeds ChannelState
  UPDATE // RTL2g

enum ChannelMode: // TB2d
  PRESENCE
  PUBLISH
  SUBSCRIBE
  PRESENCE_SUBSCRIBE

class ChannelStateChange: // TH*
  current: ChannelState // TH2, RTL2a, RTL2b
  event: ChannelEvent // TH5
  previous: ChannelState // TH2, RTL2a, RTL2b
  reason: ErrorInfo? // TH3
  resumed: Boolean // RTL2f, TH4

class ChannelOptions: // TB*
  +withCipherKey(key: Binary | String)? -> ChannelOptions // TB3
  cipher: (CipherParams | CipherParamOptions)? // RSL5a, TB2b
  params?: Dict<String, String> // TB2c
  modes?: [ChannelMode] // TB2d

class ChannelDetails: // CHD*
  channelId: String // CHD2a
  status: ChannelStatus // CHD2b

class ChannelStatus: // CHS*
  isActive: Boolean // CHS2a
  occupancy: ChannelOccupancy // CHS2b

class ChannelOccupancy: // CHO*
  metrics: ChannelMetrics // CHO2a

class ChannelMetrics: // CHM*
  connections: Int // CHM2a
  presenceConnections: Int // CHM2b
  presenceMembers: Int // CHM2c
  presenceSubscribers: Int // CHM2d
  publishers: Int // CHM2e
  subscribers: Int // CHM2f

class CipherParams: // TZ*
  algorithm: String default "AES" // TZ2a
  key: Binary // TZ2d
  keyLength: Int // TZ2b
  mode: String default "CBC" // TZ2c

class CipherParamOptions: // CO* (may be implemented as a hashmap or a class depending on language)
  algorithm?: String // CO2a
  key: Binary | String // CO2b
  keyLength?: Int // CO2c
  mode?: String // CO2d

class Crypto: // RSE*
  +getDefaultParams(CipherParamOptions) -> CipherParams // RSE1
  +generateRandomKey(keyLength: Int?) => io Binary // RSE2

class RestPresence: // RSP*
  get(
    limit: int api-default 100, // RSP3a
    clientId: String?, // RSP3a2
    connectionId: String?, // RSP3a3
  ) => io PaginatedResult<PresenceMessage> // RSP3
  history(
    start: Time, // RSP4b1
    end: Time api-default now(), // RSP4b1
    direction: .Backwards | .Forwards api-default .Backwards, // RSP4b2
    limit: int api-default 100, // RSP4b3
  ) => io PaginatedResult<PresenceMessage> // RSP4

class RealtimePresence: // RTP*
  syncComplete: Bool // RTP13
  get(
    waitForSync: Bool default true, // RTP11c1
    clientId: String?, // RTP11c2
    connectionId: String?, // RTP11c3
  ) => io [PresenceMessage] // RTP11
  history(
    start: Time, // RTP12a
    end: Time, // RTP12a
    direction: .Backwards | .Forwards api-default .Backwards, // RTP12a
    limit: int api-default 100, // RTP12a
  ) => io PaginatedResult<PresenceMessage> // RTP12
  subscribe((PresenceMessage) ->) => io // RTP6a
  subscribe(PresenceAction | [PresenceAction], (PresenceMessage) ->) => io // RTP6b
  unsubscribe() // RTP7c
  unsubscribe((PresenceMessage) ->) // RTP7a
  unsubscribe(PresenceAction, (PresenceMessage) ->) // RTP7b
  // presence state modifiers
  enter(Data?, extras?: JsonObject) => io // RTP8
  update(Data?, extras?: JsonObject) => io // RTP9
  leave(Data?, extras?: JsonObject) => io // RTP10
  enterClient(clientId: String, Data?, extras?: JsonObject) => io // RTP4, RTP14, RTP15
  updateClient(clientId: String, Data?, extras?: JsonObject) => io // RTP15
  leaveClient(clientId: String, Data?, extras?: JsonObject) => io // RTP15

enum PresenceAction: // TP2
  ABSENT // TP2
  PRESENT // TP2
  ENTER // TP2
  LEAVE // TP2
  UPDATE // TP2

class ConnectionDetails: // CD*, internal
  clientId: String? // RSA12a, CD2a
  connectionKey: String // RTN15e, CD2b
  connectionStateTtl: Duration // CD2f, RTN14e, DF1a
  maxFrameSize: Int // CD2d
  maxInboundRate: Int // CD2e
  maxMessageSize: Int // CD2c
  serverId: String // CD2g
  maxIdleInterval: Duration // CD2h

class Message: // TM*
  constructor(name: String?, data: Data?) // TM4
  constructor(name: String?, data: Data?, clientId: String?) // TM4
  +fromEncoded(JsonObject, ChannelOptions?) -> Message // TM3
  +fromEncodedArray(JsonArray, ChannelOptions?) -> [Message] // TM3
  clientId: String? // TM2b
  connectionId: String? // TM2c
  data: Data? // TM2d
  encoding: String? // TM2e
  extras: JsonObject? // TM2i
  id: String // TM2a
  name: String? // TM2g
  timestamp: Time // TM2f

class PresenceMessage // TP*
  +fromEncoded(JsonObject, ChannelOptions?) -> PresenceMessage // TP4
  +fromEncodedArray(JsonArray, ChannelOptions?) -> [PresenceMessage] // TP4
  action: PresenceAction // TP3b
  clientId: String // TP3c
  connectionId: String // TP3d
  data: Data? // TP3e
  encoding: String? // TP3f
  extras: JsonObject? // TP3i
  id: String // TP3a
  timestamp: Time // TP3g
  memberKey() -> String // TP3h

class ProtocolMessage: // internal
  action: ProtocolMessageAction // TR2, TR4a
  auth: AuthDetails? //
  channel: String? // TR4b
  channelSerial: String? // TR4c
  connectionDetails: ConnectionDetails? // RSA7b3, RTN19, TR4o
  connectionId: String? // RTN15c1, TR4d
  count: Int? // TR4g
  error: ErrorInfo? // RTN15c2, TR4h
  flags: Int? // TR4i; bitfield containing zero or more boolean flags specified in TR3
  id: String? // TR4b
  messages: [Message]? // TR4k
  msgSerial: Int? // RTN7b, TR4j
  presence: [PresenceMessage]? // TR4l
  timestamp: Time? // TR4m
  params: Dict<String, String>? // TR4q, RTL4k

enum ProtocolMessageAction: // internal
  HEARTBEAT // TR2
  ACK // TR2
  NACK // TR2
  CONNECT // TR2
  CONNECTED // TR2
  DISCONNECT // TR2
  DISCONNECTED // TR2
  CLOSE // TR2
  CLOSED // TR2
  ERROR // TR2
  ATTACH // TR2
  ATTACHED // TR2
  DETACH // TR2
  DETACHED // TR2
  PRESENCE // TR2
  MESSAGE // TR2
  SYNC // TR2
  AUTH // TR2

class AuthDetails: // AD*
  accessToken: String // AD2, RTC8a

class Connection: // RTN*
  embeds EventEmitter<ConnectionEvent, ConnectionStateChange> // RTN4a, RTN4e
  errorReason: ErrorInfo? // RTN25
  id: String? // RTN8
  key: String? // RTN9
  createRecoveryKey(): String? // RTN16g
  recoveryKey: String? // RTN16m
  state: ConnectionState // RTN4d
  close() // RTN12
  connect() // RTC1b, RTN3, RTN11
  ping() => io Duration // RTN13

enum ConnectionState: // RTN4
  INITIALIZED
  CONNECTING
  CONNECTED
  DISCONNECTED
  SUSPENDED
  CLOSING
  CLOSED
  FAILED

enum ConnectionEvent: // RTN4
  embeds ConnectionState
  UPDATE // RTN4h

class ConnectionStateChange: // TA*
  current: ConnectionState // TA2
  event: ConnectionEvent // TA5
  previous: ConnectionState // TA2
  reason: ErrorInfo? // RTN4f, TA3
  retryIn: Duration? // RTN14d, TA2

class Stats: // TS12
  intervalId: String // TS12a
  intervalTime: Time // TS12b (calculated clientside)
  unit: Stats.IntervalGranularity // TS12c
  intervalGranularity: Stats.IntervalGranularity? // TS12d (deprecated)
  all: Stats.MessageTypes // TS12e
  inbound: Stats.MessageTraffic // TS12f
  outbound: Stats.MessageTraffic // TS12g
  persisted: Stats.MessageTypes // TS12h
  connections: Stats.ConnectionTypes // TS12i
  channels: Stats.ResourceCount // TS12j
  apiRequests: Stats.RequestCount // TS12k
  tokenRequests: Stats.RequestCount // TS12l
  push: Stats.PushStats // TS12m
  xchgProducer: Stats.XchgMessages // TS12n
  xchgConsumer: Stats.XchgMessages // TS12o

enum StatsIntervalGranularity: // TS12c
  MINUTE
  HOUR
  DAY
  MONTH

class Stats.ConnectionTypes // TS4
  tls: Stats.ResourceCount // TS4a
  plain: Stats.ResourceCount // TS4b
  all: Stats.ResourceCount // TS4c

class Stats.MessageCount // TS5
  count: Int // TS5a
  data: Int // TS5b

class Stats.MessageTypes // TS6
  messages: Stats.MessageCount // TS6a
  presence: Stats.MessageCount // TS6b
  all: Stats.MessageCount // TS6c

class Stats.MessageTraffic // TS7
  realtime: Stats.MessageTypes // TS7a
  rest: Stats.MessageTypes // TS7b
  webhook: Stats.MessageTypes // TS7c
  all: Stats.MessageTypes // TS7d

class Stats.RequestCount // TS8
  succeeded: Int // TS8a
  failed: Int // TS8b
  refused: Int // TS8c

class Stats.ResourceCount // TS9
  opened: Int // TS9a
  peak: Int // TS9b
  mean: Float // TS9c
  min: Int // TS9d
  refused: Int // TS9e

class Stats.PushStats // TS10
  messages: Int // TS10a
  directPublishes: Int // TS10b
  notifications: Stats.PushNotificationCount // TS10c

class Stats.PushNotificationCount // TS13
  invalid: Int // TS13a
  attempted: Int // TS13b
  successful: Int // TS13c
  failed: Int // TS13d

class Stats.XchgMessages // TS11
  all: Stats.MessageTypes // TS11a
  producerPaid: Stats.MessageDirections // TS11b
  consumerPaid: Stats.MessageDirections // TS11c

class Stats.MessageDirections // TS14
  all: MessageTypes // TS14a
  inbound: MessageTraffic // TS14b
  outbound: MessageTraffic // TS14c

class DeviceDetails: // PCD*
  id: String // PCD2
  clientId: String? // PCD3
  formFactor: DeviceFormFactor // PCD4
  metadata: JsonObject // PCD5
  platform: DevicePlatform // PCD6
  push: DevicePushDetails // PCD7

class DevicePushDetails: // PCP*
  errorReason: ErrorInfo? // PCP2
  recipient: JsonObject // PCP3
  state: .Active | .Failing | .Failed // PCP4

class LocalDevice extends DeviceDetails: // RSH8*
  deviceIdentityToken: String // RSH8k1
  deviceSecret: String // RSH8k2

class Push: RSH1, RSH2
  admin: PushAdmin // RSH1

  // Only on platforms that support receiving push notifications:

  activate(
    registerCallback: ((ErrorInfo?, DeviceDetails?) -> io String)?,
    // Only on platforms that, after first set, can update later its push
    // device details:
    updateFailedCallback: ((ErrorInfo) ->)
  ) => io ErrorInfo? // RSH2a
  deactivate(
    deregisterCallback: ((ErrorInfo?, deviceId: String?) -> io)?
  ) => io ErrorInfo? // RSH2b

class PushAdmin: // RSH1
  publish(recipient: JsonObject, data: JsonObject) => io // RSH1a
  deviceRegistrations: PushDeviceRegistrations // RSH1b
  channelSubscriptions: PushChannelSubscriptions // RSH1c

class PushDeviceRegistrations: // RSH1b
  get(deviceId: String) => io DeviceDetails // RSH1b1
  list(params: Dict<String, String>) => io PaginatedResult<DeviceDetails> // RSH1b2
  save(DeviceDetails) => io DeviceDetails // RSH1b3
  remove(deviceId: String) => io // RSH1b4
  removeWhere(params: Dict<String, String>) => io // RSH1b5

class PushChannelSubscriptions: // RSH1c
  list(params: Dict<String, String>) => io PaginatedResult<PushChannelSubscription> // RSH1c1
  listChannels(params: Dict<String, String>?) => io PaginatedResult<String> // RSH1c2
  save(PushChannelSubscription) => io PushChannelSubscription // RSH1c3
  remove(PushChannelSubscription) => io // RSH1c4
  removeWhere(params: Dict<String, String>) => io // RSH1c5

enum DevicePlatform: // PCD6
  "android"
  "ios"
  "browser"

enum DeviceFormFactor: // PCD4
  "phone"
  "tablet"
  "desktop"
  "tv"
  "watch"
  "car"
  "embedded"
  "other"

class PushChannelSubscription: // PCS*
  +forDevice(channel: String, deviceId: String) => PushChannelSubscription // PSC5
  +forClientId(channel: String, clientId: String) => PushChannelSubscription // PSC5
  deviceId: String? // PCS2
  clientId: String? // PCS3
  channel: String // PCS4

class ErrorInfo: // TI*
  code: Int // TI1
  href: String? // TI1, TI4
  message: String // TI1
  cause: ErrorInfo? // TI1
  statusCode: Int // TI1
  requestId: String? // TI1, RSC7c

class EventEmitter<Event, Data>: // RTE*
  on((Data...) ->) // RTE3
  on(Event, (Data...) ->) // RTE3
  once((Data...) ->) // RTE4
  once(Event, (Data...) ->) // RTE4
  off() // RTE5
  off((Data...) ->) // RTE5
  off(Event, (Data...) ->) // RTE5
  emit(Event, Data...)  // internal, RTE6

class PaginatedResult<T>: // TG*
  items: [T] // TG3
  first() => io PaginatedResult<T> // TG5
  hasNext() -> Bool // TG6
  isLast() -> Bool // TG7
  next() => io PaginatedResult<T>? // TG4

class HttpPaginatedResponse // HP*
  embeds PaginatedResult<JsonObject>
  items: [JsonObject] // HP3
  statusCode: Int // HP4
  success: Bool // HP5
  errorCode: Int // HP6
  errorMessage: String // HP7
  headers: Dict<String, String> // HP8

class Plugin // PC2
  // Empty class/interface. Plugins are not expected to share any common interface.
  // An opaque base interface type for plugins is defined for type-safety in statically-typed languages.

enum PluginType // PT*
  "vcdiff" // PT2a

class VCDiffDecoder // VD*
  decode([byte] delta, [byte] base) -> [byte] // VD2a, PC3a

class DeltaExtras // DE*
  from: String // DE2a
  format: String // DE2b

class ReferenceExtras: // REX*
  timeserial: String // REX2a
  type: String //REX2b

class ClientInformation: // CR*
  +agents: Dict<String, String?> // CR2
  +agentIdentifier(additionalAgents: Dict<String, String?>?) => String // CR3; interface only offered by some libraries
</pre>

h2(#old-specs). Old specs

Use the version navigation to view older versions.  References to diffs for each version are maintained below:

* v1.1 deprecated in Mar 2020. "View 1.1 → 1.2 changes":https://github.com/ably/docs/blob/main/content/client-lib-development-guide/versions/features-1-1__1-2.diff
* v1.0 deprecated in Jan 2019. "View 1.0 → 1.1 changes":https://github.com/ably/docs/blob/main/content/client-lib-development-guide/versions/features-1-0__1-1.diff
* v0.8 deprecated in Jan 2017. "View 0.8 → 1.0 changes":https://github.com/ably/docs/blob/main/content/client-lib-development-guide/versions/features-0-8__1-0.diff
`;

describe('extractSpecPoints', () => {
  it('finds points from top of spec', () => {
    expect(extractSpecPoints(textileTop))
      .toEqual([
        'CSV1',
        'CSV1a',
        'CSV1b',
        'CSV2',
        'CSV2a',
        'CSV2b',
        'CSV2c',
        'CSV2d',
        'CSV2e',
        'G1',
        'G2',
        'G3',
        'G4',
        'G4a',
        'RSC1',
        'RSC1a',
        'RSC1b',
        'RSC1c',
        'RSC2',
        'RSC3',
        'RSC4',
        'RSC5',
        'RSC6',
        'RSC6a',
        'RSC6b',
        'RSC6b1',
        'RSC6b2',
        'RSC6b3',
        'RSC6b4',
      ]);
  });

  it('finds points from bottom of spec', () => {
    expect(extractSpecPoints(textileBottom))
      .toEqual([
        'CR1',
        'CR2',
        'CR2a',
        'CR3',
        'CR3a',
        'CR3b',
        'CR3c',
        'CR3d',
        'DF1',
        'DF1a',
        'DF1b',
      ]);
  });
});

<h1> 
NestJS Logger module
<img src="https://nestjs.com/img/logo-small.svg" height="20" alt="Nest Logo" />
</h1>

NestJS module to log in specific formats :

- Azure Monitor (previously OMS)

## Use it

Import the logger module in your main module

`app.module.ts`

```typescript
@Module({
  imports: [
    LoggerModule,
    ...
  ],
})
export class AppModule {}
```

Define which module to use in the bootstrapping of your app :

`main.ts`

```typescript
const omsLogger = new OMSLogger();
const app = await NestFactory.create(AppModule, {
  logger: omsLogger,
});
app.useLogger(omsLogger);
app.useGlobalInterceptors(new HttpLoggingInterceptor());
```

### GraphQL

If you're using GraphQL in your application, there's another interceptor for you :

```typescript
app.useGlobalInterceptors(new GraphQLLoggingInterceptor());
```

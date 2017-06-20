In TFS, the layout for a work item type is defined via XML. Therefore, you will have to add the Rest Multivalue control to your layout. Here's the series of steps that tell you how to do it.
 
Learn more about WebLayout XML [here](https://www.visualstudio.com/docs/work/reference/weblayout-xml-elements).

# How to get started
1.  Open the `Developer Command Prompt`.  Export the XML file to your desktop with the following command.
    ```
    witadmin exportwitd /collection:CollectionURL /p:Project /n:TypeName /f:FileName
    ```

2. This will create a file in the directory that you specified.  Open this file and search for "Work Item Extensions".

```xml
        <!--**********************Work Item Extensions**********************

Extension:
	Name: vsts-rest-multivalue-control
	Id: ottostreifel.vsts-rest-multivalue-control

	Control contribution:
		Id: ottostreifel.vsts-rest-multivalue-control.multivalue-form-control
		Description: A work item form control which allows selection of multiple values.
		Inputs:
			Id: FieldName
			Description: 
			Type: WorkItemField
			Field Type: String; PlainText; HTML
			Data Type: String
			IsRequired: true

			Id: Url
			Description: Url for the suggested values
			Data Type: String
			IsRequired: false


Note: For more information on work item extensions use the following topic:
http://go.microsoft.com/fwlink/?LinkId=816513
-->
```

3. Add an Extension tag to make the control available to the work item form. 

```xml
        <!--**********************************Work Item Extensions***************************
        ...

        Note: For more information on work item extensions use the following topic:
        http://go.microsoft.com/fwlink/?LinkId=816513
        -->

        <Extensions>
            <Extension Id="ottostreifel.vsts-rest-multivalue-control" />
        </Extensions>
     ```

    You can find your extension ID within the commented blob for "Work Item Extensions": 

    ```XML
        <!--**********************************Work Item Extensions***************************

    Extension:
        Name: vsts-rest-multivalue-control
        Id: ottostreifel.vsts-rest-multivalue-control
        ...
```

4. Add the ControlContribution tag for your Rest Multivalue control. This example adds it to the "Planning" group.

```xml
    <Page Id="Details">
    ...
        <Section>
        ...
            <Group Id="Planning">
            ...
                <ControlContribution Label="Label" Id="ottostreifel.vsts-rest-multivalue-control.multivalue-form-control">
                    <Inputs>
                        <Input Id="FieldName" Value="RefNameOfTheField" />
                    </Inputs>
                </ControlContribution>

                <Control Label="Risk" Type="FieldControl" FieldName="Microsoft.VSTS.Common.Risk" />
```

You can find the contribution ID and input information within the commented blob for "Work Item Extensions": 

```XML
        <!--**********************************Work Item Extensions***************************
     ...

	Control contribution:
		Id: ottostreifel.vsts-rest-multivalue-control.multivalue-form-control
		Description: A work item form control which allows selection of multiple values.
		Inputs:
			Id: FieldName
			Description: 
			Type: WorkItemField
			Field Type: String; PlainText; HTML
			Data Type: String
			IsRequired: true

			Id: Url
			Description: Url for the suggested values
			Data Type: String
			IsRequired: true

			Id: Property
			Description: If the url returns an array of objects, select which object property to use as the string. Leave blank if the server returns an array of strings.
			Data Type: String
			IsRequired: false
```

For the input tag, the content of the `Id` attribute can be either `FieldName` or `Url`.

If the Id is FieldName, the content of the `Value` attribute should be the name of the field that you want to fill. Suppose you have a field called `MyNamespace.MyField`, the input tag becomes:

```XML
<Input Id="FieldName" Value="MyNamespace.MyField" />
```


5. Re-import the *.xml* file, using witadmin. 
```
    witadmin importwitd /collection:CollectionURL /p:Project /f:FileName
``` 


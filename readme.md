Use data from urls as the suggested values of a multivalue control

![Work Item Form](img/form.png)


# How to get started
## Visual Studio Team Services

Navigate to your work item form customization page and add a rest multivalue control.

![Layout Customization](img/layoutCustomization.png)

Edit the control so it can use the right field to store your selection and the right url/property combination to be displayed. For example
```
https://<account>.visualstudio.com/<project>/_apis/build/definitions?api-version=3.0
```
```
name
```

![Options](img/options.png)

# How to query

The selected values are stored in a semicolon separated format.  To search for items that have a specific value use the "Contains Words" operator.  If searching for multiple values, use multipe "Contains Words" clauses for that field.

# Build 
You can also learn how to build your own custom control extension for the work item form [here](https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/custom-control). 
